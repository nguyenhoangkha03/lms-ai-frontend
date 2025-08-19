export default async function TestPage() {
  const refreshToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzM2YyY2Q5Ni0wZjM4LTRhODQtYWNiOS0yZjQ4YzM1MTdkYjciLCJlbWFpbCI6Im5oa2hhY250dDE2QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidGVhY2hlcl8xNzU0NjU3MTcwNDY3IiwidXNlclR5cGUiOiJ0ZWFjaGVyIiwicm9sZXMiOltdLCJpYXQiOjE3NTQ4OTIzMTksImp0aSI6ImZoMmwwazNpMDQ4bWU2cGtybnQiLCJleHAiOjE3NTc0ODQzMTl9.dTfYZJGxAOMpmDpEEKsxIFy9UWlm_7dPx2D9WSBUZrg';

  try {
    console.log('🔄 Starting token refresh process...');
    console.log(
      '🔍 Refresh token preview:',
      refreshToken.substring(0, 20) + '...'
    );
    console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      }
    );

    console.log('📡 Refresh response status:', response.status);
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return <div>Test Page</div>;
}
