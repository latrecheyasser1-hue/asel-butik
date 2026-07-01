const url = 'https://xjizbwrzqwvvpgewshan.supabase.co/rest/v1/products?select=*';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqaXpid3J6cXd2dnBnZXdzaGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODAxODcsImV4cCI6MjA5NzM1NjE4N30.BlY01Y3dviJhQC03osh7XvBva0VPSTPh9FdOt0tvOM4';

fetch(url, {
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
})
.then(res => res.json())
.then(data => {
    console.log('PRODUCTS:', data.slice ? data.slice(0,2) : data);
})
.catch(err => console.error(err));
