import crypto from 'crypto';
import { getSystemConfig } from '../lib/database';

const HUNYUAN_API_HOST = 'ai3d.tencentcloudapi.com';
const HUNYUAN_SERVICE = 'ai3d';
const HUNYUAN_VERSION = '2024-12-23';
const HUNYUAN_REGION = 'ap-guangzhou';

interface HunyuanCredentials {
  secretId: string;
  secretKey: string;
}

async function getCredentials(): Promise<HunyuanCredentials> {
  const secretId = await getSystemConfig('HUNYUAN_SECRET_ID');
  const secretKey = await getSystemConfig('HUNYUAN_SECRET_KEY');
  
  if (!secretId || !secretKey) {
    throw new Error('Hunyuan API credentials not configured');
  }
  
  return { secretId, secretKey };
}

function sha256(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function hmacSha256(key: Buffer | string, message: string): Buffer {
  return crypto.createHmac('sha256', key).update(message).digest();
}

function getDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
}

function signRequest(
  credentials: HunyuanCredentials,
  action: string,
  payload: string,
  timestamp: number
): Record<string, string> {
  const { secretId, secretKey } = credentials;
  const date = getDate(timestamp);
  
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${HUNYUAN_API_HOST}\nx-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders = 'content-type;host;x-tc-action';
  const hashedRequestPayload = sha256(payload);
  
  const canonicalRequest = [
    httpRequestMethod,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedRequestPayload
  ].join('\n');
  
  const algorithm = 'TC3-HMAC-SHA256';
  const credentialScope = `${date}/${HUNYUAN_SERVICE}/tc3_request`;
  const hashedCanonicalRequest = sha256(canonicalRequest);
  
  const stringToSign = [
    algorithm,
    timestamp.toString(),
    credentialScope,
    hashedCanonicalRequest
  ].join('\n');
  
  const secretDate = hmacSha256(`TC3${secretKey}`, date);
  const secretService = hmacSha256(secretDate, HUNYUAN_SERVICE);
  const secretSigning = hmacSha256(secretService, 'tc3_request');
  const signature = hmacSha256(secretSigning, stringToSign).toString('hex');
  
  const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Host': HUNYUAN_API_HOST,
    'X-TC-Action': action,
    'X-TC-Version': HUNYUAN_VERSION,
    'X-TC-Timestamp': timestamp.toString(),
    'X-TC-Region': HUNYUAN_REGION,
    'Authorization': authorization
  };
}

async function callHunyuanAPI(action: string, params: Record<string, unknown>): Promise<unknown> {
  const credentials = await getCredentials();
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify(params);
  const headers = signRequest(credentials, action, payload, timestamp);
  
  const response = await fetch(`https://${HUNYUAN_API_HOST}`, {
    method: 'POST',
    headers,
    body: payload
  });
  
  const result = await response.json();
  
  if (result.Response?.Error) {
    throw new Error(`Hunyuan API Error: ${result.Response.Error.Code} - ${result.Response.Error.Message}`);
  }
  
  return result.Response;
}

export interface SubmitJobResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface QueryJobResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  glbUrl?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Submit a 3D model generation job using image URL
 * @param imageUrl URL of the image to convert
 * @param generateType Generation type: Normal (with texture), Geometry (white model), LowPoly
 */
export async function submitHunyuanTo3DProJob(
  imageUrl: string,
  generateType: 'Normal' | 'Geometry' | 'LowPoly' = 'Normal'
): Promise<SubmitJobResult> {
  try {
    // Download image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');
    
    const result = await callHunyuanAPI('SubmitHunyuanTo3DProJob', {
      ImageBase64: imageBase64,
      GenerateType: generateType
    }) as { JobId: string };
    
    return { success: true, jobId: result.JobId };
  } catch (error) {
    console.error('Error submitting Hunyuan job:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Query the status of a 3D model generation job
 * @param jobId The job ID returned from submitHunyuanTo3DProJob
 */
export async function queryHunyuanTo3DProJob(jobId: string): Promise<QueryJobResult> {
  try {
    const result = await callHunyuanAPI('QueryHunyuanTo3DProJob', {
      JobId: jobId
    }) as {
      Status: 'WAIT' | 'RUN' | 'DONE' | 'FAIL';
      ResultFile3Ds?: Array<{
        Type: string;
        Url: string;
        PreviewImageUrl?: string;
      }>;
    };
    
    if (result.Status === 'DONE') {
      const glbFile = result.ResultFile3Ds?.find(f => f.Type === 'glb' || f.Url.endsWith('.glb'));
      return {
        status: 'completed',
        glbUrl: glbFile?.Url,
        previewUrl: glbFile?.PreviewImageUrl,
      };
    } else if (result.Status === 'FAIL') {
      return { status: 'failed', error: 'Model generation failed' };
    } else if (result.Status === 'RUN') {
      return { status: 'processing' };
    } else {
      return { status: 'pending' };
    }
  } catch (error) {
    console.error('Error querying Hunyuan job:', error);
    return { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
