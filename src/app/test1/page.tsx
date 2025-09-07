export default function Test1() {
  fetch(
    'http://localhost:3001/api/v1/notifications?page=1&limit=5&sortBy=newest',
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    }
  )
    .then(res => res.json())
    .then(data => {
      console.log('🔍 API Response:', data);
      console.log('🔍 Notifications count:', data.data?.notifications?.length);
      console.log('🔍 Total:', data.data?.total);
    })
    .catch(err => console.error('❌ API Error:', err));

  return <h1>Hánh</h1>;
}
