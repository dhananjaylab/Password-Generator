import React, { useState } from 'react';
import { Construction, KeyRound, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Copy, Check, QrCode, Mic } from 'lucide-react';
import zxcvbn from 'zxcvbn';
import QRCode from 'react-qr-code';

export default function App() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ status: 'idle' | 'testing' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'password' | 'passphrase' | 'pronounceable'>('password');

  // Password Options
  const [pwdLength, setPwdLength] = useState<number>(14);
  const [pwdUpper, setPwdUpper] = useState<boolean>(true);
  const [pwdLower, setPwdLower] = useState<boolean>(true);
  const [pwdNumbers, setPwdNumbers] = useState<boolean>(true);
  const [pwdSymbols, setPwdSymbols] = useState<boolean>(false);

  // Passphrase Options
  const [phraseWords, setPhraseWords] = useState<number>(5);
  const [phraseSeparator, setPhraseSeparator] = useState<string>('-');
  const [phraseIncludeNumber, setPhraseIncludeNumber] = useState<boolean>(false);
  const [phraseIncludeSymbol, setPhraseIncludeSymbol] = useState<boolean>(false);

  // Pronounceable Options
  const [pronounceableLength, setPronounceableLength] = useState<number>(10);
  const [pronounceableCapitalize, setPronounceableCapitalize] = useState<boolean>(true);
  const [pronounceableNumber, setPronounceableNumber] = useState<boolean>(true);

  const API_BASE_URL = '/api';

  const generatePassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        length: pwdLength.toString(),
        uppercase: pwdUpper.toString(),
        lowercase: pwdLower.toString(),
        numbers: pwdNumbers.toString(),
        symbols: pwdSymbols.toString(),
      });
      const response = await fetch(`${API_BASE_URL}/password?${params}`);
      if (!response.ok) throw new Error('Failed to fetch password from backend');
      const data = await response.json();
      setResult(data.password);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the FastAPI backend. Make sure it is running on http://localhost:8000.');
      // Fallback for preview purposes
      let pools = [];
      if (pwdUpper) pools.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      if (pwdLower) pools.push('abcdefghijklmnopqrstuvwxyz');
      if (pwdNumbers) pools.push('0123456789');
      if (pwdSymbols) pools.push('!@#$%^&*()_+~`|}{[]:;?><,./-=');
      if (pools.length === 0) pools.push('abcdefghijklmnopqrstuvwxyz');
      
      let allChars = pools.join('');
      let pwdChars = pools.map(p => p.charAt(Math.floor(Math.random() * p.length)));
      while (pwdChars.length < pwdLength) {
        pwdChars.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
      }
      pwdChars.sort(() => Math.random() - 0.5);
      setResult(pwdChars.slice(0, pwdLength).join(''));
    } finally {
      setLoading(false);
    }
  };

  const generatePassphrase = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        word_count: phraseWords.toString(),
        separator: phraseSeparator,
        include_number: phraseIncludeNumber.toString(),
        include_symbol: phraseIncludeSymbol.toString(),
      });
      const response = await fetch(`${API_BASE_URL}/passphrase?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch passphrase from backend');
      }
      const data = await response.json();
      setResult(data.passphrase);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not connect to the FastAPI backend. Make sure it is running on http://localhost:8000.');
      // Fallback for preview purposes
      const fallbackWords = ['apple', 'pear', 'kiwi', 'mango', 'banana', 'grape', 'lemon', 'peach', 'cherry', 'melon'];
      let selectedWords = [];
      for(let i=0; i<phraseWords; i++) {
          selectedWords.push(fallbackWords[Math.floor(Math.random() * fallbackWords.length)]);
      }
      let sep = phraseSeparator === 'space' ? ' ' : phraseSeparator;
      let res = selectedWords.join(sep);
      if (phraseIncludeNumber) res += Math.floor(Math.random() * 10);
      if (phraseIncludeSymbol) {
          const syms = '!@#$%^&*';
          res += syms.charAt(Math.floor(Math.random() * syms.length));
      }
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const generatePronounceable = async () => {
    setLoading(true);
    setError(null);
    setShowQr(false);
    try {
      const params = new URLSearchParams({
        length: pronounceableLength.toString(),
        capitalize: pronounceableCapitalize.toString(),
        include_number: pronounceableNumber.toString(),
      });
      const response = await fetch(`${API_BASE_URL}/pronounceable?${params}`);
      if (!response.ok) throw new Error('Failed to fetch from backend');
      const data = await response.json();
      setResult(data.pronounceable);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the FastAPI backend.');
      // Fallback
      const vowels = "aeiouy";
      const consonants = "bcdfghjklmnprstvz";
      let pwd = "";
      for (let i = 0; i < pronounceableLength; i++) {
        pwd += i % 2 === 0 ? consonants.charAt(Math.floor(Math.random() * consonants.length)) : vowels.charAt(Math.floor(Math.random() * vowels.length));
      }
      if (pronounceableCapitalize) pwd = pwd.charAt(0).toUpperCase() + pwd.slice(1);
      if (pronounceableNumber) pwd += Math.floor(Math.random() * 10);
      setResult(pwd);
    } finally {
      setLoading(false);
    }
  };

  const testApi = async () => {
    setApiStatus({ status: 'testing', message: 'Testing API connection...' });
    try {
      const response = await fetch(`${API_BASE_URL}/test`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API test failed');
      }
      const data = await response.json();
      setApiStatus({ status: 'success', message: data.message || 'API responded successfully.' });
    } catch (err: any) {
      console.error(err);
      setApiStatus({ status: 'error', message: err.message || 'Could not contact API.' });
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = result ? zxcvbn(result) : null;
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-600'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-zinc-800 pb-6">
          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
            <Construction className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">PW & Passphrase Generator</h1>
            <p className="text-zinc-400 mt-1">Generate secure passwords and passphrases</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/50">
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'password' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
              >
                <KeyRound className="w-4 h-4" />
                Password
              </button>
              <button
                onClick={() => setActiveTab('passphrase')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'passphrase' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                Passphrase
              </button>
              <button
                onClick={() => setActiveTab('pronounceable')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pronounceable' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
              >
                <Mic className="w-4 h-4" />
                Phonetic
              </button>
            </div>

            {/* Password Section */}
            {activeTab === 'password' && (
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="text-zinc-400">Length</label>
                      <span className="text-emerald-400 font-mono">{pwdLength}</span>
                    </div>
                    <input 
                      type="range" 
                      min="8" max="64" 
                      value={pwdLength} 
                      onChange={(e) => setPwdLength(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={pwdUpper} onChange={(e) => setPwdUpper(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2 accent-emerald-500" />
                      Uppercase
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={pwdLower} onChange={(e) => setPwdLower(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2 accent-emerald-500" />
                      Lowercase
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={pwdNumbers} onChange={(e) => setPwdNumbers(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2 accent-emerald-500" />
                      Numbers
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={pwdSymbols} onChange={(e) => setPwdSymbols(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2 accent-emerald-500" />
                      Symbols
                    </label>
                  </div>
                </div>

                <button
                  onClick={generatePassword}
                  disabled={loading || (!pwdUpper && !pwdLower && !pwdNumbers && !pwdSymbols)}
                  className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Generate secure password'}
                </button>
              </div>
            )}

            {/* Passphrase Section */}
            {activeTab === 'passphrase' && (
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="text-zinc-400">Word Count</label>
                      <span className="text-emerald-400 font-mono">{phraseWords}</span>
                    </div>
                    <input 
                      type="range" 
                      min="3" max="10" 
                      value={phraseWords} 
                      onChange={(e) => setPhraseWords(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Separator</label>
                    <select 
                      value={phraseSeparator} 
                      onChange={(e) => setPhraseSeparator(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 outline-none"
                    >
                      <option value="-">Hyphen (-)</option>
                      <option value="_">Underscore (_)</option>
                      <option value="space">Space ( )</option>
                      <option value=".">Period (.)</option>
                      <option value=",">Comma (,)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={phraseIncludeNumber} onChange={(e) => setPhraseIncludeNumber(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2 accent-emerald-500" />
                      Include Number
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={phraseIncludeSymbol} onChange={(e) => setPhraseIncludeSymbol(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2 accent-emerald-500" />
                      Include Symbol
                    </label>
                  </div>
                </div>

                <button
                  onClick={generatePassphrase}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Generate secure passphrase'}
                </button>
              </div>
            )}

            {/* Phonetic Section */}
            {activeTab === 'pronounceable' && (
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="text-zinc-400">Length</label>
                      <span className="text-emerald-400 font-mono">{pronounceableLength}</span>
                    </div>
                    <input 
                      type="range" 
                      min="4" max="24" 
                      value={pronounceableLength} 
                      onChange={(e) => setPronounceableLength(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={pronounceableCapitalize} onChange={(e) => setPronounceableCapitalize(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2 accent-emerald-500" />
                      Capitalize First
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={pronounceableNumber} onChange={(e) => setPronounceableNumber(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2 accent-emerald-500" />
                      Include Number
                    </label>
                  </div>
                </div>

                <button
                  onClick={generatePronounceable}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Generate phonetic password'}
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800/50">
              <button
                onClick={testApi}
                disabled={apiStatus.status === 'testing'}
                className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {apiStatus.status === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Test API'}
              </button>
              
              {apiStatus.status === 'success' && (
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{apiStatus.message}</p>
                </div>
              )}
              
              {apiStatus.status === 'error' && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{apiStatus.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 flex flex-col">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6">Generated Result</h2>
            
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
              {result ? (
                <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="text-center">
                    <h3 className="text-2xl font-medium text-emerald-400 break-all">{result}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-4 bg-black/40 rounded-xl border border-zinc-800/50 font-mono text-sm text-zinc-300 break-all text-center">
                      {result}
                    </div>
                    <button
                      onClick={() => setShowQr(!showQr)}
                      className={`p-4 rounded-xl transition-colors border flex items-center justify-center ${showQr ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700/50'}`}
                      title="Show QR Code"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors border border-zinc-700/50 flex items-center justify-center"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* QR Code Display */}
                  {showQr && (
                    <div className="flex justify-center p-6 bg-white rounded-xl animate-in fade-in zoom-in-95 duration-200">
                      <QRCode value={result} size={200} level="M" />
                    </div>
                  )}

                  {/* Password Strength Meter */}
                  {strength && (
                    <div className="space-y-2 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Strength: <span className="text-zinc-200 font-medium">{strengthLabels[strength.score]}</span></span>
                        <span className="text-zinc-500 text-xs">Crack time: {strength.crack_times_display.offline_slow_hashing_1e4_per_second}</span>
                      </div>
                      <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-zinc-800">
                        {[0, 1, 2, 3, 4].map((level) => (
                          <div 
                            key={level} 
                            className={`flex-1 transition-all duration-500 ${level <= strength.score ? strengthColors[strength.score] : 'bg-transparent'}`}
                          />
                        ))}
                      </div>
                      {strength.feedback.warning && (
                        <p className="text-xs text-amber-400 mt-2">{strength.feedback.warning}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3 text-zinc-500">
                  <KeyRound className="w-12 h-12 mx-auto opacity-20" />
                  <p>Click a button to generate</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-400/90 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-medium mb-1">Backend Connection Issue</p>
                  <p>{error}</p>
                  <p className="mt-2 text-amber-500/70 text-xs">Showing fallback data for preview purposes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
