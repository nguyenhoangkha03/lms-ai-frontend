'use client';

import { useRegisterMutation } from '@/lib/redux/api/auth-api';
import { Brain } from 'lucide-react';

export default function TestPage() {
  const [register] = useRegisterMutation();

  const registerForm = {
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'admin@gmail.com',
    password: 'Khagom12@',
    confirmPassword: 'Khagom12@',
    userType: 'admin',
    acceptTerms: true,
  };

  const handleSubmit = async () => {
    try {
      const result = await register({
        ...registerForm,
        userType: 'admin',
        agreedToTerms: true,
      }).unwrap();
      console.log('✅ Register success:', result);
    } catch (error) {
      console.error('❌ Register failed:', error);
    }
  };

  return (
    <div className="p-4">
      <Brain className="mb-4 h-10 w-10 text-red-500" />
      <button
        onClick={handleSubmit}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Test Register
      </button>
    </div>
  );
}
