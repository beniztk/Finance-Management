import React from 'react';
import { useAuth } from './AuthProvider';
import { UserCircle2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = async (person: 'yuval' | 'benny') => {
    setError('');
    setLoading(true);

    try {
      await signIn(person);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'שגיאה בהתחברות. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center mb-4">
            <UserCircle2 className="w-16 h-16 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">
            ניהול פיננסי
          </h1>
          <h2 className="text-lg text-center text-gray-600 mb-6">
            משפחת זבורובסקי
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => handleSignIn('yuval')}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'מתחבר...' : 'התחבר כיובל'}
            </button>

            <button
              onClick={() => handleSignIn('benny')}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-green-600 text-white transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'מתחבר...' : 'התחבר כבני'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;