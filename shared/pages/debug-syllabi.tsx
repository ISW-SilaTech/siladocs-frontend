"use client";

import React, { useState, useEffect } from 'react';
import api from '@/shared/config/axios';
import { SyllabiService } from '@/shared/services/syllabi.service';

const DebugSyllabi = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRawData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DEBUG] Fetching raw syllabi data...');
      const response = await api.get('/syllabi');
      console.log('[DEBUG] Raw response:', response);
      console.log('[DEBUG] Response data:', response.data);
      console.log('[DEBUG] Response status:', response.status);
      console.log('[DEBUG] Response headers:', response.headers);
      console.log('[DEBUG] Data is array?', Array.isArray(response.data));
      console.log('[DEBUG] Data length:', response.data?.length);

      setData({
        status: response.status,
        dataLength: response.data?.length,
        dataIsArray: Array.isArray(response.data),
        headers: response.headers,
        data: response.data,
        firstItem: response.data?.[0],
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[DEBUG] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchViaService = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DEBUG] Fetching via SyllabiService...');
      const syllabi = await SyllabiService.getAll();
      console.log('[DEBUG] Service returned:', syllabi);
      console.log('[DEBUG] Service data length:', syllabi.length);

      setData({
        source: 'SyllabiService',
        count: syllabi.length,
        data: syllabi,
        firstItem: syllabi[0],
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[DEBUG] Service error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Debug Syllabi</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchRawData} style={{ padding: '10px', marginRight: '10px', cursor: 'pointer' }}>
          Fetch Raw API Data
        </button>
        <button onClick={fetchViaService} style={{ padding: '10px', cursor: 'pointer' }}>
          Fetch via Service
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {data && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h2>Response Details:</h2>
          <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '3px', overflowX: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugSyllabi;
