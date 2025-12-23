import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import {
  createPetImage, getPetImagesByUserId, getPetImageById, deletePetImage,
  createModel3d, getModel3dsByUserId, getModel3dById, updateModel3d, deleteModel3d,
  getAllPrintSizes, getPrintSizeById,
  createOrder, getOrdersByUserId, getOrderById, getOrderByNumber, updateOrder,
  createPayment, getPaymentByOrderId, getPaymentByPaypalOrderId, updatePayment,
} from "./lib/database";
import { submitHunyuanTo3DProJob, queryHunyuanTo3DProJob } from "./services/hunyuan3d";
import { createPayPalOrder, capturePayPalOrder, getApprovalUrl } from "./services/paypal";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Pet Images
  petImages: router({
    upload: protectedProcedure
      .input(z.object({
        imageBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.imageBase64, 'base64');
        const fileKey = `pet-images/${ctx.user.id}/${nanoid()}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Create thumbnail (simplified - just use same URL for now)
        const thumbnailUrl = url;
        
        // Save to database
        const imageId = await createPetImage({
          user_id: ctx.user.id,
          original_url: url,
          thumbnail_url: thumbnailUrl,
          file_name: input.fileName,
          file_size: buffer.length,
          mime_type: input.mimeType,
          width: null,
          height: null,
        });
        
        if (!imageId) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to save image' });
        }
        
        return { id: imageId, url, thumbnailUrl };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return getPetImagesByUserId(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const image = await getPetImageById(input.id);
        if (!image || image.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Image not found' });
        }
        return image;
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const image = await getPetImageById(input.id);
        if (!image || image.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Image not found' });
        }
        await deletePetImage(input.id);
        return { success: true };
      }),
  }),

  // 3D Models
  models: router({
    generate: protectedProcedure
      .input(z.object({
        petImageId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get the pet image
        const image = await getPetImageById(input.petImageId);
        if (!image || image.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Image not found' });
        }
        
        // Submit to Hunyuan 3D API
        const jobResult = await submitHunyuanTo3DProJob(image.original_url);
        
        if (!jobResult.success || !jobResult.jobId) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: jobResult.error || 'Failed to submit 3D generation job' 
          });
        }
        
        // Create model record
        const modelId = await createModel3d({
          user_id: ctx.user.id,
          pet_image_id: input.petImageId,
          job_id: jobResult.jobId,
          status: 'processing',
          glb_url: null,
          preview_url: null,
          error_message: null,
          completed_at: null,
        });
        
        if (!modelId) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create model record' });
        }
        
        return { id: modelId, jobId: jobResult.jobId, status: 'processing' };
      }),
    
    checkStatus: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const model = await getModel3dById(input.id);
        if (!model || model.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Model not found' });
        }
        
        // If still processing, check with Hunyuan API
        if (model.status === 'processing' && model.job_id) {
          const statusResult = await queryHunyuanTo3DProJob(model.job_id);
          
          if (statusResult.status === 'completed' && statusResult.glbUrl) {
            // Download GLB and upload to our S3
            const glbResponse = await fetch(statusResult.glbUrl);
            const glbBuffer = Buffer.from(await glbResponse.arrayBuffer());
            const glbKey = `models/${ctx.user.id}/${nanoid()}.glb`;
            const { url: glbUrl } = await storagePut(glbKey, glbBuffer, 'model/gltf-binary');
            
            // Update model record
            await updateModel3d(model.id, {
              status: 'completed',
              glb_url: glbUrl,
              preview_url: statusResult.previewUrl || null,
            });
            
            return { ...model, status: 'completed' as const, glb_url: glbUrl, preview_url: statusResult.previewUrl };
          } else if (statusResult.status === 'failed') {
            await updateModel3d(model.id, {
              status: 'failed',
              error_message: statusResult.error || 'Generation failed',
            });
            return { ...model, status: 'failed' as const, error_message: statusResult.error };
          }
        }
        
        return model;
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return getModel3dsByUserId(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const model = await getModel3dById(input.id);
        if (!model || model.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Model not found' });
        }
        return model;
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const model = await getModel3dById(input.id);
        if (!model || model.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Model not found' });
        }
        await deleteModel3d(input.id);
        return { success: true };
      }),
  }),

  // Print Sizes
  printSizes: router({
    list: publicProcedure.query(async () => {
      return getAllPrintSizes();
    }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const size = await getPrintSizeById(input.id);
        if (!size) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Print size not found' });
        }
        return size;
      }),
  }),

  // Orders
  orders: router({
    create: protectedProcedure
      .input(z.object({
        model3dId: z.number(),
        printSizeId: z.number(),
        quantity: z.number().min(1).default(1),
        shippingName: z.string(),
        shippingAddress: z.string(),
        shippingCity: z.string(),
        shippingState: z.string(),
        shippingCountry: z.string(),
        shippingPostalCode: z.string(),
        shippingPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify model belongs to user
        const model = await getModel3dById(input.model3dId);
        if (!model || model.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Model not found' });
        }
        
        if (model.status !== 'completed') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Model is not ready for printing' });
        }
        
        // Get print size
        const printSize = await getPrintSizeById(input.printSizeId);
        if (!printSize) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Print size not found' });
        }
        
        const unitPrice = Number(printSize.price_usd);
        const totalPrice = unitPrice * input.quantity;
        const orderNumber = `PET3D-${Date.now()}-${nanoid(6).toUpperCase()}`;
        
        const orderId = await createOrder({
          order_number: orderNumber,
          user_id: ctx.user.id,
          model_3d_id: input.model3dId,
          print_size_id: input.printSizeId,
          quantity: input.quantity,
          unit_price_usd: unitPrice,
          total_price_usd: totalPrice,
          status: 'pending',
          shipping_name: input.shippingName,
          shipping_address: input.shippingAddress,
          shipping_city: input.shippingCity,
          shipping_state: input.shippingState,
          shipping_country: input.shippingCountry,
          shipping_postal_code: input.shippingPostalCode,
          shipping_phone: input.shippingPhone || null,
          notes: input.notes || null,
        });
        
        if (!orderId) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create order' });
        }
        
        // Send notification to owner about new order
        try {
          await notifyOwner({
            title: `New Order: ${orderNumber}`,
            content: `A new 3D print order has been placed!\n\nOrder: ${orderNumber}\nCustomer: ${input.shippingName}\nSize: ${printSize.name}\nQuantity: ${input.quantity}\nTotal: $${totalPrice.toFixed(2)}\nShipping to: ${input.shippingCity}, ${input.shippingCountry}`,
          });
        } catch (e) {
          console.warn('[Order] Failed to send notification:', e);
        }
        
        return { id: orderId, orderNumber, totalPrice };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return getOrdersByUserId(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await getOrderById(input.id);
        if (!order || order.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        return order;
      }),
    
    getByNumber: protectedProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ ctx, input }) => {
        const order = await getOrderByNumber(input.orderNumber);
        if (!order || order.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        return order;
      }),
  }),

  // Payments
  payments: router({
    create: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        returnUrl: z.string(),
        cancelUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order || order.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        
        if (order.status !== 'pending') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order is not pending payment' });
        }
        
        // Create PayPal order
        const paypalOrder = await createPayPalOrder(
          Number(order.total_price_usd),
          order.order_number,
          input.returnUrl,
          input.cancelUrl
        );
        
        // Save payment record
        const paymentId = await createPayment({
          order_id: order.id,
          paypal_order_id: paypalOrder.id,
          paypal_capture_id: null,
          amount_usd: Number(order.total_price_usd),
          currency: 'USD',
          status: 'pending',
          payer_email: null,
          payer_id: null,
          raw_response: paypalOrder as unknown as Record<string, unknown>,
        });
        
        if (!paymentId) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create payment record' });
        }
        
        const approvalUrl = getApprovalUrl(paypalOrder);
        
        return { paymentId, paypalOrderId: paypalOrder.id, approvalUrl };
      }),
    
    capture: protectedProcedure
      .input(z.object({ paypalOrderId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const payment = await getPaymentByPaypalOrderId(input.paypalOrderId);
        if (!payment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Payment not found' });
        }
        
        const order = await getOrderById(payment.order_id);
        if (!order || order.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        
        // Capture payment
        const captureResult = await capturePayPalOrder(input.paypalOrderId);
        
        if (captureResult.status === 'COMPLETED') {
          const capture = captureResult.purchase_units[0]?.payments?.captures?.[0];
          
          await updatePayment(payment.id, {
            status: 'completed',
            paypal_capture_id: capture?.id || null,
            payer_email: captureResult.payer?.email_address || null,
            payer_id: captureResult.payer?.payer_id || null,
            raw_response: captureResult as unknown as Record<string, unknown>,
          });
          
          await updateOrder(order.id, { status: 'paid' });
          
          // Send notification about successful payment
          try {
            await notifyOwner({
              title: `Payment Received: ${order.order_number}`,
              content: `Payment has been successfully captured!\n\nOrder: ${order.order_number}\nAmount: $${order.total_price_usd}\nPayPal Transaction: ${capture?.id || 'N/A'}\nPayer Email: ${captureResult.payer?.email_address || 'N/A'}`,
            });
          } catch (e) {
            console.warn('[Payment] Failed to send notification:', e);
          }
          
          return { success: true, status: 'completed' };
        }
        
        return { success: false, status: captureResult.status };
      }),
    
    getByOrderId: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order || order.user_id !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        return getPaymentByOrderId(input.orderId);
      }),
  }),

  // Chat support
  chat: router({
    send: publicProcedure
      .input(z.object({
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are a helpful customer support assistant for Pet3D Studio, a service that transforms pet photos into 3D printed figurines.

Key information about our service:
- We use AI to convert pet photos into 3D models
- We offer 6 print sizes: Mini ($99), Small ($199), Medium ($349), Large ($549), XL ($749), XXL ($999)
- Processing time: 3D model generation takes about 5-10 minutes
- Shipping: We ship worldwide, delivery takes 2-4 weeks
- Materials: High-quality PLA plastic, hand-painted details available
- Returns: 30-day satisfaction guarantee

Be friendly, helpful, and concise. If you don't know something specific, suggest contacting support@pet3d.studio.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.message },
          ],
        });
        
        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get response' });
        }
        
        return { message: content };
      }),
  }),
});

export type AppRouter = typeof appRouter;
