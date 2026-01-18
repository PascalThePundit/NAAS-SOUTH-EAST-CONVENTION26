import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './Registration.css';

const RegistrationForm = () => {
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

  // Fixed Registration Fee
  const totalAmount = 13000;
  
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load Flutterwave Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateEmail = (email) => {
    // Simple, robust email regex that allows standard emails
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
          formData.tshirtSize
          // healthConcerns is no longer required
      );
  };

  const checkDuplicateAndPay = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
         // 1. Anti-Duplicate Check (Fix 2: Try/Catch with 401 handling)
         try {
             const { data: existingUser, error: searchError } = await supabase
             .from('registrations')
             .select('id')
             .eq('full_name', formData.fullName)
             .eq('institution', formData.institution)
             .single();

             if (searchError) {
                 // If it's a 401 (Unauthorized) or 403, we assume policy check failed and proceed
                 if (searchError.status === 401 || searchError.status === 403) {
                     console.warn("Duplicate check skipped due to permission (401/403). Assuming no duplicate.");
                 } else if (searchError.code !== 'PGRST116') { 
                     // PGRST116 is "no rows found", which is good
                     console.warn("Duplicate check warning:", searchError);
                 }
             } else if (existingUser) {
                 throw new Error("Duplicate registration detected for this name and institution.");
             }
         } catch (dupError) {
             // If we explicitly threw the duplicate error, stop everything
             if (dupError.message.includes("Duplicate registration")) {
                 throw dupError;
             }
             // Otherwise, just log and proceed
             console.warn("Duplicate check error caught:", dupError);
         }

         // 2. Trigger Flutterwave
         if (!window.FlutterwaveCheckout) {
             throw new Error("Payment gateway not loaded. Please refresh the page.");
         }

         const config = {
            public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: Date.now().toString(),
            amount: totalAmount,
            currency: 'NGN',
            payment_options: 'card,mobilemoney,ussd',
            customer: {
              email: formData.email,
              phone_number: formData.phone,
              name: formData.fullName,
            },
            customizations: {
              title: 'NAAS Convention Registration',
              description: 'Delegate Fee Payment',
              logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
            },
            callback: async function (response) {
                // Fix 3: Log full response
                console.log('Full Payment Response:', response);
                
                // Fix 3: Case-insensitive success/completed check
                const status = response.status ? response.status.toLowerCase() : '';
                if (status === 'successful' || status === 'completed') {
                    // 3. Save to Supabase (Success Callback Logic)
                    try {
                        const { error } = await supabase
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
                                payment_status: 'paid',
                                transaction_id: response.transaction_id || response.flw_ref || 'N/A'
                            },
                            ]);

                        if (error) {
                            console.error("Supabase Error:", error);
                            alert("Payment successful but registration failed to save: " + error.message);
                            throw error;
                        }

                        console.log('Registration saved to Supabase');
                        setIsSuccess(true);
                    } catch (dbError) {
                        console.error('Database Save Failed:', dbError);
                        let dbMsg = dbError.message || JSON.stringify(dbError);
                        setErrorMsg(`Payment successful, but registration data failed to save: ${dbMsg}. Please contact support.`);
                    }
                } else {
                    console.warn("Payment not successful:", response);
                    setErrorMsg('Payment failed or cancelled.');
                }
            },
            onclose: function() {
                if (!isSuccess) {
                   setIsSubmitting(false);
                   console.log('Payment modal closed');
                }
            }
          };

          window.FlutterwaveCheckout(config);

    } catch (err) {
        console.error("Pre-payment check failed:", err);
        setErrorMsg(err.message);
        setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isFormValid()) {
      setTouched({
        fullName: true, email: true, phone: true, department: true, institution: true, zone: true, skill: true, tshirtSize: true
      });
      setErrorMsg('Please fill in all required fields correctly.');
      return;
    }

    checkDuplicateAndPay();
  };

  if (isSuccess) {
      return (
          <div className="registration-wrapper">
              <div className="glass-card-ui" style={{ textAlign: 'center', maxWidth: '500px' }}>
                  <h2 style={{ color: '#ffd700', marginBottom: '1rem' }}>Success!</h2>
                  <p>Welcome to the NAAS Convention.</p>
                  <p>Your payment and registration are confirmed.</p>
                  <button 
                    className="cyber-btn" 
                    onClick={() => { setIsSuccess(false); setFormData({...formData, fullName: '', healthConcerns: ''}); }}
                    style={{ marginTop: '2rem' }}
                  >
                      Register Another Delegate
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="registration-wrapper">

      <form className="glass-card-ui" onSubmit={handleFormSubmit} noValidate>
        {/* ... form content ... */}
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

            {/* Total Display */}
            <div className="total-counter">
                <div className="fee-wrapper">
                     <div>
                        <span className="currency">₦</span>
                        <span>{totalAmount.toLocaleString()}</span>
                     </div>
                     <span className="fee-subtitle">
                        Registration Covers; Access, Accommodation, Convention Materials, T-shirt and much more.
                     </span>
                </div>
            </div>

            <button type="submit" className="cyber-btn" disabled={!isFormValid() || isSubmitting}>
                {isSubmitting ? 'Processing Payment...' : `Register & Pay ₦${totalAmount.toLocaleString()}`}
            </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;