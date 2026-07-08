import axios from 'axios';
import { CRMRecord, ColumnMapping } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
});

export const uploadCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/csv/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export const extractRecords = async (
  uploadId: string,
  mappings: ColumnMapping,
  onProgress: (event: any) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      `${API_URL}/api/csv/extract?uploadId=${uploadId}&mappings=${encodeURIComponent(
        JSON.stringify(mappings)
      )}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onProgress(data);

        if (data.type === 'complete') {
          eventSource.close();
          resolve(data.data);
        }
      } catch (error) {
        reject(error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      reject(new Error('Connection lost'));
    };
  });
};
