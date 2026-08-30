import React, { useState, useRef } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import { 
  UploadCloud, AlertCircle, ScanFace, Scissors
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AiStyleSuggestionPage() {
  const [gender, setGender] = useState('male');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFace = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const apiGender = gender === 'male' ? 'men' : 'women';
      formData.append('gender', apiGender);

      const res = await api.post('/ai/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;

      if (data.error) {
        toast.error(data.message || 'Analysis failed. Please try a clearer photo.');
        setIsAnalyzing(false);
        return;
      }

      if (data.is_confident === false) {
        toast.error(data.message || "Photo isn't clear enough — please retake with a front-facing, well-lit photo.");
        setIsAnalyzing(false);
        return;
      }

      setResult(data);
      toast.success(`Face shape detected: ${data.face_shape?.toUpperCase()} ⚡`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'AI Analysis failed');
      console.error('AI fetch error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', position: 'relative' }}>
      <Navbar />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.012) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 2rem 6rem', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '16px', height: '1px', background: 'rgba(0,0,0,0.2)' }} />
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '0.65rem',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.4)',
            }}>
              AI Stylist Partner
            </span>
            <div style={{ width: '16px', height: '1px', background: 'rgba(0,0,0,0.2)' }} />
          </div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            color: '#000000',
            letterSpacing: '-0.03em',
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}>
            Discover Your<br /><em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.45)' }}>Perfect Hairstyle</em>
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.5)', maxWidth: '32rem', margin: '0 auto', fontSize: '0.875rem', lineHeight: 1.7, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Upload your portrait photo and let our custom AI analyze facial architecture to recommend hairstyles tailored exactly to your unique face shape.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          
          {/* Left Column: Upload */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            
            {/* Gender Switch */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid rgba(0,0,0,0.08)', padding: '1.25rem',
              background: 'rgba(0,0,0,0.005)',
            }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)' }}>Select Profile Model:</span>
              <div style={{ display: 'flex', border: '1px solid rgba(0,0,0,0.15)', padding: '0.2rem', background: '#ffffff' }}>
                <button
                  onClick={() => setGender('male')}
                  style={{
                    padding: '0.35rem 1.25rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 805,
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: gender === 'male' ? '#000000' : 'transparent',
                    color: gender === 'male' ? '#ffffff' : 'rgba(0,0,0,0.45)',
                    border: 'none',
                  }}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  style={{
                    padding: '0.35rem 1.25rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 805,
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: gender === 'female' ? '#000000' : 'transparent',
                    color: gender === 'female' ? '#ffffff' : 'rgba(0,0,0,0.45)',
                    border: 'none',
                  }}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Upload Zone */}
            <div 
              style={{
                border: '1px dashed rgba(0,0,0,0.18)',
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.003)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#000000'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'}
            >
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />

              {previewUrl ? (
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={previewUrl} 
                    alt="Face Preview" 
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', filter: 'grayscale(15%)' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <span className="btn-secondary" style={{ background: '#ffffff', color: '#000000', borderColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Change portrait photo</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem 0' }}>
                  <div style={{
                    width: '56px', height: '56px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}>
                    <UploadCloud size={20} color="rgba(0,0,0,0.4)" />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', color: '#000000', marginBottom: '0.5rem', fontWeight: 800 }}>Upload portrait</h3>
                  <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.8rem', maxWidth: '240px', margin: '0 auto 1.5rem', lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Drag & drop or browse. Ensure your face is centered and lit well.
                  </p>
                  <button className="btn-secondary" style={{ pointerEvents: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Select File</button>
                </div>
              )}
            </div>

            {/* Guidelines */}
            <div style={{ border: '1px solid rgba(0,0,0,0.08)', padding: '1.5rem', background: 'rgba(0,0,0,0.005)' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <AlertCircle size={16} color="rgba(0,0,0,0.4)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <strong style={{ color: '#000000', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.05em', fontWeight: 800 }}>Portrait Rules</strong>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <li>Position eyes horizontally level with the camera lens.</li>
                    <li>Provide flat even lighting across the forehead and nose.</li>
                    <li>Avoid high angles or tilting of your face profile.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis Results */}
          <div className="col-span-12 lg:col-span-6">
            {!result ? (
              <div style={{
                border: '1px solid rgba(0,0,0,0.08)',
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.003)',
              }}>
                {isAnalyzing ? (
                  <>
                    <div className="spinner" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', color: '#000000', marginBottom: '0.5rem', fontWeight: 800 }}>Analyzing facial layout...</h3>
                    <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.8rem', maxWidth: '280px', lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Measuring forehead-to-jaw ratio, cheekbone structure, and outlining face layout.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: '56px', height: '56px',
                      border: '1px dashed rgba(0,0,0,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                    }}>
                      <ScanFace size={20} color="rgba(0,0,0,0.3)" />
                    </div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', color: 'rgba(0,0,0,0.45)', marginBottom: '0.5rem', fontWeight: 700 }}>Awaiting portrait</h3>
                    <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.8rem', maxWidth: '240px', lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Once photo is uploaded, click to initiate AI outline scans.
                    </p>
                    {previewUrl && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); analyzeFace(); }}
                        className="btn-primary"
                        style={{ marginTop: '2rem', width: '100%', borderRadius: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        Analyze Portrait Face
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Face shape + confidence card */}
                <div style={{ border: '1px solid #000000', padding: '2rem', background: '#ffffff', position: 'relative' }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', display: 'block', marginBottom: '0.5rem' }}>Geometric Face Output</span>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '2.5rem', color: '#000000', letterSpacing: '-0.02em', marginBottom: '1rem', textTransform: 'capitalize' }}>
                    {result.face_shape}
                  </h2>

                  {/* Confidence bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>AI Confidence</span>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', fontWeight: 800, color: '#000000' }}>{Math.round((result.confidence || 0) * 100)}%</span>
                    </div>
                    <div style={{ height: '3px', background: 'rgba(0,0,0,0.08)', width: '100%' }}>
                      <div style={{ height: '100%', background: '#000000', width: `${Math.round((result.confidence || 0) * 100)}%`, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                </div>

                {/* Recommended Cuts — names only */}
                {(result.men_styles || result.women_styles) && (
                  <div>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: '0.65rem',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: 'rgba(0,0,0,0.5)', marginBottom: '1rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                      <Scissors size={10} /> Recommended Cuts
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(result.men_styles || result.women_styles || []).map((style, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            border: '1px solid rgba(0,0,0,0.08)', padding: '0.9rem 1.1rem',
                            background: '#ffffff', transition: 'all 0.25s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{
                            width: '28px', height: '28px', flexShrink: 0,
                            background: '#000000', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#ffffff',
                            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', fontWeight: 800,
                          }}>
                            {index + 1}
                          </div>
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#000000' }}>{style}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); setPreviewUrl(''); setSelectedFile(null); }}
                  className="btn-secondary"
                  style={{ width: '100%', borderRadius: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Analyze another photo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
