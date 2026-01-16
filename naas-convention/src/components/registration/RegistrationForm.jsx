import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
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
    wantsTshirt: false,
    tshirtSize: 'M', 
    healthConcerns: '',
  });

  const [totalAmount, setTotalAmount] = useState(10000);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic Pricing Logic
  useEffect(() => {
    setTotalAmount(formData.wantsTshirt ? 12500 : 10000);
  }, [formData.wantsTshirt]);

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

  const isValid = (name) => {
      if (!touched[name]) return true; 
      return formData[name] && formData[name].toString().trim() !== '';
  };
  
  const isFormValid = () => {
      return (
          formData.fullName && 
          formData.email && 
          formData.phone && 
          formData.department && 
          formData.institution && 
          formData.zone && 
          formData.skill && 
          formData.gender
      );
  };

  // Flutterwave Config
  const flutterwaveConfig = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: Date.now(),
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
      description: 'Payment for Convention Delegate Fee',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

  const saveToSupabase = async (paymentResponse) => {
    setErrorMsg('');
    
    if (!supabase) {
      setErrorMsg('System Error: Database connection not initialized.');
      setIsSubmitting(false);
      return;
    }

    try {
        // 1. Anti-Duplicate Check (Fail-safe)
        try {
            const { data: existingUser, error: searchError } = await supabase
            .from('registrations')
            .select('id')
            .eq('full_name', formData.fullName)
            .eq('institution', formData.institution)
            .single();

            if (searchError && searchError.code !== 'PGRST116') { 
                console.warn("Duplicate check failed (likely auth/RLS), proceeding anyway:", searchError);
            } else if (existingUser) {
                throw new Error("Duplicate registration detected for this name and institution.");
            }
        } catch (dupError) {
            if (dupError.message.includes("Duplicate registration")) {
                throw dupError;
            }
            console.warn("Skipping duplicate check due to error:", dupError);
        }

        // 2. Insert Data
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
                tshirt_size: formData.wantsTshirt ? formData.tshirtSize : null,
                health_concerns: formData.healthConcerns,
                total_amount: totalAmount,
                payment_status: 'paid_via_flutterwave' // Updated status
            },
            ]);

        if (error) throw error;

        console.log('Registration successful');
        setIsSuccess(true);
        
    } catch (error) {
        console.error('Submission error:', error);
        let message = 'Registration failed, but payment was successful. Please contact support.';
        if (error.message) message = error.message;
        setErrorMsg(message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isFormValid()) {
      setTouched({
        fullName: true, email: true, phone: true, department: true, institution: true, zone: true, skill: true
      });
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    // Trigger Flutterwave
    handleFlutterwavePayment({
      callback: (response) => {
         console.log("Payment Success:", response);
         closePaymentModal(); // this will close the modal programmatically
         saveToSupabase(response);
      },
      onClose: () => {
         setIsSubmitting(false);
         console.log('Payment modal closed');
      },
    });
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
                    onClick={() => { setIsSuccess(false); setFormData({...formData, fullName: ''}); }}
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
            
            

            {/* T-Shirt Toggle */}
            <div className="toggle-container">
                <div className="toggle-label">
                    <span className="toggle-title">Include T-Shirt?</span>
                    <span className="toggle-price">
                        {formData.wantsTshirt ? '+ ₦2,500' : 'No Thanks'}
                    </span>
                </div>
                <div>
                    <input 
                        type="checkbox" 
                        id="tshirt-switch" 
                        className="switch-checkbox"
                        name="wantsTshirt"
                        checked={formData.wantsTshirt}
                        onChange={handleChange}
                    />
                    <label htmlFor="tshirt-switch" className="switch-label">Toggle</label>
                </div>
            </div>

            {/* T-Shirt Size - Only if selected */}
            {formData.wantsTshirt && (
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
                    <label className="input-label" style={{ top: '-12px', fontSize: '12px', color: '#ffd700' }}>T-Shirt Size</label>
                </div>
            )}

            {/* Total Display */}
            <div className="total-counter">
                <span className="currency">₦</span>
                <span>{totalAmount.toLocaleString()}</span>
            </div>

            <button type="submit" className="cyber-btn" disabled={!isFormValid() || isSubmitting}>
                {isSubmitting ? 'Processing Payment...' : `Pay ₦${totalAmount.toLocaleString()} via Flutterwave`}
            </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
