import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import '../registration/Registration.css'; // Reusing existing styles for consistency

const PitchEntry = ({ isOpen, onClose, onVerified }) => {
  // Steps: 'verify' -> 'guidelines-bubble' -> 'requirements-bubble' -> 'main-guidelines'
  const [step, setStep] = useState('verify'); 
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    // ... (existing handleVerify logic remains unchanged)
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedUid = uid.trim();

    if (!trimmedUid || trimmedUid.length !== 6) {
        setError('Please enter a valid 6-digit UID.');
        setLoading(false);
        return;
    }
    
    console.log('Testing UID:', trimmedUid);

    try {
      // Step A: Check registrations table
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .select('id, full_name, email, transaction_id')
        .eq('transaction_id', trimmedUid)
        .maybeSingle();

      if (regError) {
          console.error('Supabase Error:', regError);
          // Show specific error message from Supabase
          throw new Error(regError.message || regError.details || 'Database error checking registration.');
      }

      if (!registration) {
        setError('Invalid UID. Please check your registration email.');
        setLoading(false);
        return;
      }

      // Step B: Check business_pitches table for duplicates
      const { data: existingPitch, error: pitchError } = await supabase
        .from('business_pitches')
        .select('id')
        .eq('uid', trimmedUid) // Check against uid column
        .maybeSingle();

      if (pitchError) {
          console.error('Supabase Error:', pitchError);
          throw new Error(pitchError.message || 'Database error checking existing pitches.');
      }

      if (existingPitch) {
        setError('This UID has already submitted a pitch. Only one entry allowed.');
        setLoading(false);
        return;
      }

      // Valid and not used
      if (onVerified) {
          onVerified(registration);
      }
      // Move to next stage
      setStep('guidelines-bubble');

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'video') {
        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
        // 50MB in bytes = 50 * 1024 * 1024
        const maxSize = 50 * 1024 * 1024; 

        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|avi)$/i)) {
            alert('Invalid video format. Please upload MP4, MOV, or AVI.');
            e.target.value = '';
            setVideoFile(null);
            return;
        }
        if (file.size > maxSize) {
            alert('Video file is too large. Max size is 50MB.');
            e.target.value = '';
            setVideoFile(null);
            return;
        }
        setVideoFile(file);
    } else if (type === 'document') {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        
        if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|pptx)$/i)) {
            alert('Invalid document format. Please upload PDF, DOCX, or PPTX.');
            e.target.value = '';
            setDocFile(null);
            return;
        }
        setDocFile(file);
    }
  };

  const uploadPitchFiles = async () => {
      const timestamp = new Date().getTime();
      
      // Upload Video
      const videoExt = videoFile.name.split('.').pop();
      const videoPath = `${uid}/video.${videoExt}`;
      console.log('Attempting upload to bucket: pitch_vault with path:', videoPath);
      const { data: videoData, error: videoError } = await supabase.storage
          .from('pitch_vault')
          .upload(videoPath, videoFile, {
              cacheControl: '3600',
              upsert: true,
              contentType: videoFile.type
          });

      if (videoError) throw videoError;

      // Upload Document
      const docExt = docFile.name.split('.').pop();
      const docPath = `${uid}/document.${docExt}`;
      console.log('Attempting upload to bucket: pitch_vault with path:', docPath);
      const { data: docData, error: docError } = await supabase.storage
          .from('pitch_vault')
          .upload(docPath, docFile, {
              cacheControl: '3600',
              upsert: true,
              contentType: docFile.type
          });

      if (docError) throw docError;

      return { videoPath, docPath };
  };

  const handleSubmit = async () => {
      if (!videoFile || !docFile) {
          alert('Please select both a video and a document.');
          return;
      }

      setUploading(true);
      setError('');

      try {
          // 1. Upload Verification & File Upload
          
          // --- Video Upload ---
          const videoExt = videoFile.name.split('.').pop();
          const videoPath = `${uid}/video.${videoExt}`; // Ensure no leading slash
          
          console.log('Attempting upload to bucket: pitch_vault with path:', videoPath);
          console.log('Video Type:', videoFile.type);

          const { data: vUpload, error: videoError } = await supabase.storage
              .from('pitch_vault')
              .upload(videoPath, videoFile, { 
                  cacheControl: '3600', 
                  upsert: true,
                  contentType: videoFile.type 
              });

          if (videoError) {
              console.error('Video Upload Failed - Full Error Object:', videoError);
              throw new Error(`Video Upload Failed: ${videoError.message} (Check console for details)`);
          }
          if (!vUpload) throw new Error('Video upload failed: No data returned.');
          console.log('Video Upload Success:', vUpload);

          // --- Document Upload ---
          // Only starts after video succeeds
          const docExt = docFile.name.split('.').pop();
          const docPath = `${uid}/document.${docExt}`; // Ensure no leading slash
          
          console.log('Attempting upload to bucket: pitch_vault with path:', docPath);
          console.log('Document Type:', docFile.type);

          const { data: dUpload, error: docError } = await supabase.storage
              .from('pitch_vault')
              .upload(docPath, docFile, { 
                  cacheControl: '3600', 
                  upsert: true,
                  contentType: docFile.type
              });

          if (docError) {
              console.error('Document Upload Failed - Full Error Object:', docError);
              throw new Error(`Document Upload Failed: ${docError.message} (Check console for details)`);
          }
          if (!dUpload) throw new Error('Document upload failed: No data returned.');
          console.log('Document Upload Success:', dUpload);

          // 2. Get Public URLs
          const { data: videoUrlData } = supabase.storage.from('pitch_vault').getPublicUrl(videoPath);
          const { data: docUrlData } = supabase.storage.from('pitch_vault').getPublicUrl(docPath);

          // 3. Clean Data Object
          const submissionData = { 
              uid: String(uid).trim(),
              video_url: videoUrlData.publicUrl,
              document_url: docUrlData.publicUrl
          };

          // 4. Final Data Check
          console.log('Final Data Check:', submissionData);

          // 5. Database Insert
          const { error: dbError } = await supabase
              .from('business_pitches')
              .insert([submissionData], { returning: 'minimal' });

          if (dbError) {
              console.error('Database Insertion Error:', dbError);
              console.log('Error Details:', dbError.details);
              console.log('Error Hint:', dbError.hint);
              alert(`Submission Error: ${dbError.message}\nDetails: ${dbError.details || 'None'}\nHint: ${dbError.hint || 'None'}`);
              throw dbError;
          }

          // 6. Success Sequence
          setUid('');
          setVideoFile(null);
          setDocFile(null);
          setAgreed(false);
          setStep('success');

      } catch (err) {
          console.error('Full Submission Error Object:', err);
          setError(err.message || 'An error occurred during submission.');
      } finally {
          setUploading(false);
      }
  };

  const renderContent = () => {
      switch(step) {
          case 'verify':
              return (
                <div className="glass-card-ui" style={{ 
                    maxWidth: '500px', 
                    width: '90%', 
                    position: 'relative', 
                    margin: '0',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                  <button 
                      onClick={onClose}
                      style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontSize: '1.5rem',
                          cursor: 'pointer'
                      }}
                  >
                      &times;
                  </button>
          
                  <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '1rem' }}>
                      Business Pitch Entry
                  </h2>
                  
                    <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#eee' }}>
                        Enter your Unique Registration ID (UID) to verify your eligibility. 
                        <br/>
                        <small style={{ color: '#aaa' }}>Check your email for the 6-digit ID sent during registration.</small>
                    </p>
    
                    <form onSubmit={handleVerify}>
                        <div className="input-container">
                            <input 
                                type="text" 
                                className={`input-field ${uid ? 'has-value' : ''}`}
                                value={uid}
                                onChange={(e) => setUid(e.target.value.replace(/\D/g, '').slice(0, 6))} // Only digits, max 6
                                placeholder=""
                                maxLength={6}
                            />
                            <label className="input-label">Unique Registration ID (UID)</label>
                        </div>
    
                        {error && (
                            <div style={{ 
                                color: '#ff6b6b', 
                                textAlign: 'center', 
                                marginBottom: '1rem',
                                backgroundColor: 'rgba(255,0,0,0.1)',
                                padding: '10px',
                                borderRadius: '4px'
                            }}>
                                {error}
                            </div>
                        )}
    
                        <button 
                            type="submit" 
                            className="cyber-btn" 
                            style={{ width: '100%', marginTop: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify & Proceed'}
                        </button>
                    </form>
                </div>
              );

          case 'guidelines-bubble':
              return (
                <div className="glass-card-ui" style={{ 
                    maxWidth: '500px', 
                    width: '90%', 
                    textAlign: 'center',
                    border: '1px solid #ffd700',
                    animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <h2 style={{ color: '#ffd700', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                        Business Pitch Guidelines
                    </h2>
                    <p style={{ lineHeight: '1.6', color: '#fff', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        All submissions must be completed on or before 15th March. 
                        Late submissions will not be accepted. 
                        The best presentation will be rewarded with the Grand prize.
                    </p>
                    <button 
                        className="cyber-btn" 
                        onClick={() => setStep('requirements-bubble')}
                    >
                        Close
                    </button>
                </div>
              );

          case 'requirements-bubble':
            return (
              <div className="glass-card-ui" style={{ 
                  maxWidth: '500px', 
                  width: '90%', 
                  textAlign: 'center',
                  border: '1px solid #00c6ff',
                  animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                  <h2 style={{ color: '#00c6ff', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                      Required Submissions
                  </h2>
                  <div style={{ textAlign: 'left', display: 'inline-block', marginBottom: '2rem' }}>
                      <ul style={{ color: '#fff', lineHeight: '1.8', fontSize: '1.1rem', listStyleType: 'none', padding: 0 }}>
                          <li style={{ marginBottom: '10px' }}><strong>1. Business Pitch Video</strong> (Max 4 mins).</li>
                          <li><strong>2. Business Pitch Document</strong> (PDF, PPT, or Word).</li>
                      </ul>
                  </div>
                  <br />
                  <button 
                      className="cyber-btn" 
                      style={{ background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', borderColor: '#00c6ff' }}
                      onClick={() => setStep('main-guidelines')}
                  >
                      Close
                  </button>
              </div>
            );

        case 'main-guidelines':
            return (
                <div className="glass-card-ui" style={{ 
                    maxWidth: '700px', 
                    width: '95%', 
                    position: 'relative',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                     <button 
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        &times;
                    </button>

                    <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '2rem' }}>
                        Submit Your Pitch
                    </h2>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Agreement</h3>
                        <p style={{ color: '#ccc', marginBottom: '1rem' }}>
                            By proceeding, you acknowledge that your submission represents your own original work and that you agree to the terms of the NAAS Convention Business Pitch competition.
                        </p>
                        
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            cursor: 'pointer',
                            padding: '1rem',
                            background: agreed ? 'rgba(37, 211, 102, 0.1)' : 'transparent',
                            border: agreed ? '1px solid #25D366' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                        }}>
                            <input 
                                type="checkbox" 
                                checked={agreed} 
                                onChange={(e) => setAgreed(e.target.checked)} 
                                style={{ transform: 'scale(1.5)', accentColor: '#25D366' }}
                            />
                            <span style={{ color: '#fff', fontWeight: '500' }}>
                                I have read and agree to the Business Pitch guidelines.
                            </span>
                        </label>
                    </div>

                    <div style={{ opacity: agreed ? 1 : 0.5, pointerEvents: agreed ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Upload Materials</h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: '#00c6ff', marginBottom: '0.5rem' }}>
                                1. Business Pitch Video (Max 4 mins, 50MB)
                            </label>
                            <input 
                                type="file" 
                                accept="video/mp4,video/quicktime,video/x-msvideo"
                                onChange={(e) => handleFileChange(e, 'video')}
                                style={{ color: '#fff' }}
                            />
                            {videoFile && <div style={{ color: '#25D366', fontSize: '0.9rem', marginTop: '0.3rem' }}>Selected: {videoFile.name}</div>}
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', color: '#00c6ff', marginBottom: '0.5rem' }}>
                                2. Business Pitch Document (PDF, PPTX, DOCX)
                            </label>
                            <input 
                                type="file" 
                                accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                onChange={(e) => handleFileChange(e, 'document')}
                                style={{ color: '#fff' }}
                            />
                            {docFile && <div style={{ color: '#25D366', fontSize: '0.9rem', marginTop: '0.3rem' }}>Selected: {docFile.name}</div>}
                        </div>

                        {error && (
                            <div style={{ 
                                color: '#ff6b6b', 
                                textAlign: 'center', 
                                marginBottom: '1rem',
                                backgroundColor: 'rgba(255,0,0,0.1)',
                                padding: '10px',
                                borderRadius: '4px'
                            }}>
                                {error}
                            </div>
                        )}

                        <button 
                            className="cyber-btn" 
                            style={{ width: '100%' }}
                            disabled={!videoFile || !docFile || uploading}
                            onClick={handleSubmit}
                        >
                            {uploading ? 'Uploading & Submitting...' : 'Submit Pitch'}
                        </button>
                    </div>
                </div>
            );

        case 'success':
            return (
                <div className="glass-card-ui" style={{ 
                    maxWidth: '500px', 
                    width: '90%', 
                    textAlign: 'center',
                    border: '1px solid #25D366',
                    animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <div style={{ fontSize: '4rem', color: '#25D366', marginBottom: '1rem' }}>✓</div>
                    <h2 style={{ color: '#25D366', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                        Submission Successful!
                    </h2>
                    <p style={{ lineHeight: '1.6', color: '#fff', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Submission Successful! Your pitch has been recorded for the NAAS Convention 2026.
                    </p>
                    <button 
                        className="cyber-btn" 
                        style={{ background: '#25D366', borderColor: '#25D366' }}
                        onClick={onClose}
                    >
                        Return to Home
                    </button>
                </div>
            );

          default:
              return null;
      }
  }

  return (
    <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)'
    }}>
        {renderContent()}
    </div>
  );
};

export default PitchEntry;