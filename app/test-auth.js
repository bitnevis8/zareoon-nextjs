// تست ساده برای بررسی احراز هویت
export async function testAuth() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('Auth test result:', data);
    return data;
  } catch (error) {
    console.error('Auth test error:', error);
    return null;
  }
}
