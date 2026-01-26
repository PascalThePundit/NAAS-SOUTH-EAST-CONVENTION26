import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import emailjs from '@emailjs/browser';
import './Registration.css';

// Initialize EmailJS with the provided Public Key
emailjs.init("OQJ0VkkQYN3J5RiDi");

const RegistrationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    email: '',
    phone: '',
    department: '',
    institution: '',
    zone: 'Enugu', 
    skill: 'Graphic Design',
    tshirtSize: 'M', 
    healthConcerns: '',
  });

  const [receiptFiles, setReceiptFiles] = useState([]);

  // Fixed Registration Fee
  const totalAmount = 13000;
  
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper function to generate a unique 6-digit ID
  const generate6DigitID = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (files.length > 13) {
          alert('You can upload a maximum of 13 images.');
          e.target.value = null;
          setReceiptFiles([]);
          return;
      }
      setReceiptFiles(Array.from(files));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const isValid = (name) => {
      if (!touched[name]) return true; 
      if (name === 'email') {
          return formData.email && validateEmail(formData.email);
      }
      return formData[name] && formData[name].toString().trim() !== '';
  };
  
  const isFormValid = () => {
      return (
          formData.fullName && 
          formData.email && validateEmail(formData.email) &&
          formData.phone && 
          formData.department && 
          formData.institution && 
          formData.zone && 
          formData.skill && 
          formData.gender &&
          formData.tshirtSize &&
          receiptFiles.length > 0
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isFormValid()) {
      setTouched({
        fullName: true, email: true, phone: true, department: true, institution: true, zone: true, skill: true, tshirtSize: true
      });
      setErrorMsg('Please fill in all required fields and upload the payment receipt.');
      return;
    }

    setIsSubmitting(true);

    try {
        // Step 1: Duplicate Check (Must happen before uploads)
        // Check if Email already exists
        const { data: existingEmail, error: emailError } = await supabase
            .from('registrations')
            .select('id')
            .eq('email', formData.email)
            .maybeSingle(); // Use maybeSingle() to avoid 406/PGRST116 errors on no result

        if (emailError) {
            console.error("Duplicate check error:", emailError);
            throw new Error('Failed to verify email availability. Please try again.');
        }

        if (existingEmail) {
            throw new Error('This email is already registered for the convention.');
        }

        // Step 2: Generate Transaction ID
        const newTransactionId = generate6DigitID();

        // Step 3: Upload receipts
        const uploadedUrls = [];

        for (const file of receiptFiles) {
            const fileExt = file.name.split('.').pop();
            // Create a cleaner file name to avoid path issues
            const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, file);

            if (uploadError) {
                throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('receipts')
                .getPublicUrl(fileName);
            
            uploadedUrls.push(publicUrl);
        }

        // Step 4: Insert Data (Single Entry)
        // Store as comma-separated string per instructions for 'receipt_url' column
        const receiptUrlString = uploadedUrls.join(',');

        const { error: dbError } = await supabase
            .from('registrations')
            .insert([
            {
                full_name: formData.fullName,
                gender: formData.gender,
                email: formData.email,
                phone: formData.phone,
                department: formData.department,
                institution: formData.institution,
                zone: formData.zone,
                skill_choice: formData.skill,
                tshirt_size: formData.tshirtSize,
                health_concerns: formData.healthConcerns,
                total_amount: totalAmount,
                payment_status: 'pending_verification',
                receipt_url: receiptUrlString,
                transaction_id: newTransactionId
            },
            ]);

        if (dbError) {
            // If the insert fails, we might want to log it or attempt cleanup, but for now just throw
            throw new Error(`Registration save failed: ${dbError.message}`);
        }

        // Step 5: Trigger Email (Only after successful DB insert)
        try {
            const templateParams = {
                full_name: formData.fullName,
                transaction_id: newTransactionId,
                to_email: formData.email 
            };
            
            await emailjs.send(
                'service_ace5z9o',
                'template_f3kjxeg',
                templateParams,
                'OQJ0VkkQYN3J5RiDi'
            );
            console.log('Confirmation email sent successfully.');
        } catch (emailError) {
            console.error('Email sending failed, but registration was successful:', emailError);
            // We do NOT block success state here, as the registration itself worked.
        }

        // Step 6: Final Success State
        setGeneratedId(newTransactionId);
        setIsSuccess(true);
        if (onSuccess) onSuccess(true);

    } catch (err) {
        console.error("Submission failed:", err);
        setErrorMsg(err.message);
        // Alert is optional but helpful for mobile users
        if (!err.message.includes('registered')) {
             window.alert(`Submission Failed: ${err.message}`); 
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isSuccess) {
      return (
          <div className="registration-wrapper">
              <div className="glass-card-ui" style={{ textAlign: 'center', maxWidth: '500px' }}>
                  <h2 style={{ color: '#ffd700', marginBottom: '1rem' }}>Registration Successful!</h2>
                  <p>Welcome to the NAAS Convention.</p>
                  
                  <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd700', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Your Transaction ID</p>
                    <h3 style={{ color: '#ffd700', fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '4px', margin: '0.5rem 0' }}>{generatedId}</h3>
                    <p style={{ fontSize: '0.9rem' }}>Please keep this ID safe. You will need it for accreditation.</p>
                  </div>

                  <p style={{ marginBottom: '1.5rem', color: '#eee' }}>
                      A confirmation email has been sent to your inbox.
                  </p>

                  <a 
                    href="https://chat.whatsapp.com/IjgWoid4PFBKU7eOOeDHND" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cyber-btn"
                    style={{ 
                        display: 'inline-block', 
                        textDecoration: 'none', 
                        marginBottom: '1rem',
                        backgroundColor: '#25D366', // WhatsApp Green
                        borderColor: '#25D366',
                        color: '#fff'
                    }}
                  >
                      Join South-East WhatsApp Group
                  </a>
                  
                  <br />

                  <a 
                    href="https://forms.gle/UtJXZyCLDxqrGESp6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cyber-btn"
                    style={{ 
                        display: 'inline-block', 
                        textDecoration: 'none', 
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', // Blue gradient
                        color: '#fff',
                        marginTop: '0.5rem'
                    }}
                  >
                      Join a Sub-Committee Team
                  </a>

                  <button 
                    className="cyber-btn" 
                    onClick={() => { 
                        setIsSuccess(false); 
                        if (onSuccess) onSuccess(false);
                        setFormData({...formData, fullName: '', healthConcerns: '', email: '', phone: ''}); 
                        setReceiptFiles([]);
                        setGeneratedId(null);
                        setIsSubmitting(false);
                    }}
                    style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.8rem 1.5rem', opacity: 0.8 }}
                  >
                      Register Another Delegate
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="registration-wrapper">

      <form className="glass-card-ui" onSubmit={handleSubmit} noValidate>
        <div className="form-content">
            <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Delegate Registration
            </h2>
            {errorMsg && (
                <div style={{ 
                    backgroundColor: 'rgba(255, 0, 0, 0.2)', 
                    border: '1px solid #ff4444', 
                    color: '#ffcccc', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                }}>
                    {errorMsg}
                </div>
            )}

            {/* Full Name */}
            <div className="input-container">
                <input 
                    type="text" 
                    name="fullName" 
                    className={`input-field ${!isValid('fullName') ? 'invalid' : ''} ${formData.fullName ? 'has-value' : ''}`}
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                />
                <label className="input-label">Full Name</label>
            </div>

            {/* Gender */}
            <div className="input-container" style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '0.5rem 0' }}>
                <span style={{ color: '#aaa' }}>Gender:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff' }}>
                    <input 
                        type="radio" 
                        name="gender" 
                        value="Male" 
                        checked={formData.gender === 'Male'} 
                        onChange={handleChange} 
                    /> Male
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff' }}>
                    <input 
                        type="radio" 
                        name="gender" 
                        value="Female" 
                        checked={formData.gender === 'Female'} 
                        onChange={handleChange} 
                    /> Female
                </label>
            </div>

            {/* Email */}
            <div className="input-container">
                <input 
                    type="email" 
                    name="email" 
                    className={`input-field ${!isValid('email') ? 'invalid' : ''} ${formData.email ? 'has-value' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                />
                <label className="input-label">Email Address</label>
            </div>

             {/* Phone */}
             <div className="input-container">
                <input 
                    type="tel" 
                    name="phone" 
                    className={`input-field ${!isValid('phone') ? 'invalid' : ''} ${formData.phone ? 'has-value' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                />
                <label className="input-label">Phone Number</label>
            </div>

             {/* Dept */}
             <div className="input-container">
                <input 
                    type="text" 
                    name="department" 
                    className={`input-field ${!isValid('department') ? 'invalid' : ''} ${formData.department ? 'has-value' : ''}`}
                    value={formData.department}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                />
                <label className="input-label">Department</label>
            </div>

            {/* Institution */}
            <div className="input-container">
                <input 
                    type="text" 
                    name="institution" 
                    className={`input-field ${!isValid('institution') ? 'invalid' : ''} ${formData.institution ? 'has-value' : ''}`}
                    value={formData.institution}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                />
                <label className="input-label">Institution / Chapter</label>
            </div>

             {/* Zone Dropdown */}
             <div className="input-container">
                <select 
                    name="zone" 
                    className={`input-field ${!isValid('zone') ? 'invalid' : ''} has-value`}
                    value={formData.zone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                >
                    <option value="Enugu">Enugu</option>
                    <option value="Imo">Imo</option>
                    <option value="Ebonyi">Ebonyi</option>
                    <option value="Anambra">Anambra</option>
                </select>
                <label className="input-label" style={{ top: '-12px', fontSize: '12px', color: '#ffd700' }}>Zone</label>
            </div>

            {/* Skill Dropdown */}
            <div className="input-container">
                <select 
                    name="skill" 
                    className={`input-field ${!isValid('skill') ? 'invalid' : ''} has-value`}
                    value={formData.skill}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                >
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Baking & Small Chops Making">Baking & Small Chops Making</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Interior Decoration & Event Styling">Interior Decoration & Event Styling</option>
                    <option value="Photography, Videography & Drone Piloting">Photography, Videography & Drone Piloting</option>
                    <option value="Perfume Making">Perfume Making</option>
                    <option value="Professional First Aid Training">Professional First Aid Training</option>
                </select>
                <label className="input-label" style={{ top: '-12px', fontSize: '12px', color: '#ffd700' }}>Skill Acquisition</label>
            </div>
            
            {/* T-Shirt Size - Always Visible */}
            <div className="input-container">
                <select 
                    name="tshirtSize" 
                    className={`input-field has-value`}
                    value={formData.tshirtSize}
                    onChange={handleChange}
                    required 
                >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="XXXL">XXXL</option>
                </select>
                <label className="input-label" style={{ top: '-12px', fontSize: '12px', color: '#ffd700' }}>T-Shirt Size (Required)</label>
            </div>

             {/* Health Concerns - Optional Again */}
             <div className="input-container">
                <textarea 
                    name="healthConcerns" 
                    className={`input-field ${formData.healthConcerns ? 'has-value' : ''}`}
                    value={formData.healthConcerns}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows="2"
                ></textarea>
                <label className="input-label">Health Concerns (Optional)</label>
            </div>

            {/* Receipt Upload - Styled */}
            <div className="file-upload-container">
                <input 
                    type="file" 
                    id="receipt-upload" 
                    className="file-upload-input"
                    accept=".pdf, .png, .jpg, .jpeg"
                    onChange={handleChange}
                    multiple
                    required
                />
                <label htmlFor="receipt-upload" className={`file-upload-label ${receiptFiles.length > 0 ? 'has-file' : ''}`}>
                     <div className="upload-icon-wrapper">
                        {receiptFiles.length > 0 ? (
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                             </svg>
                        ) : (
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                             </svg>
                        )}
                     </div>
                     <div className="upload-text-content">
                        <span className="upload-main-text">
                            {receiptFiles.length > 0 ? `${receiptFiles.length} File(s) Selected` : 'Upload proof of registration (receipt) paid to your local chapter'}
                        </span>
                        <span className="upload-sub-text">
                            {receiptFiles.length > 0 
                                ? receiptFiles.map(f => f.name).join(', ') 
                                : 'Click to browse (PDF, JPG, PNG) - Max 13'}
                        </span>
                     </div>
                </label>
            </div>

            {/* Total Display */}
            <div className="total-counter">
                <div className="fee-wrapper">
                     <div>
                        <span className="currency">₦</span>
                        <span>{totalAmount.toLocaleString()}</span>
                     </div>
                     <span className="fee-subtitle">
                        Registration Fee
                     </span>
                     <div style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '0.5rem', lineHeight: '1.4' }}>
                        Covers: Programs Access, Accommodation, Convention Materials, T-shirt, and much more.
                     </div>
                </div>
            </div>

            <button type="submit" className="cyber-btn" disabled={!isFormValid() || isSubmitting}>
                {isSubmitting ? 'Submitting Registration...' : `Submit Registration`}
            </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;