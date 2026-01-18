import React, { useState } from 'react';
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

  const [receiptFile, setReceiptFile] = useState(null);

  // Fixed Registration Fee
  const totalAmount = 13000;
  
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setReceiptFile(files[0]);
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
          formData.tshirtSize &&
          receiptFile // Receipt is required
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
        // 1. Check for duplicate registration
        try {
             const { data: existingUser, error: searchError } = await supabase
             .from('registrations')
             .select('id')
             .eq('full_name', formData.fullName)
             .eq('institution', formData.institution)
             .single();

             if (searchError) {
                 if (searchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
                     console.warn("Duplicate check warning:", searchError);
                 }
             } else if (existingUser) {
                 throw new Error("Duplicate registration detected for this name and institution.");
             }
         } catch (dupError) {
             if (dupError.message.includes("Duplicate registration")) {
                 throw dupError;
             }
             console.warn("Duplicate check error caught:", dupError);
         }

        // 2. Upload Receipt
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (uploadError) {
          throw new Error(`Receipt upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);


        // 3. Save to Supabase
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
                receipt_url: publicUrl,
                transaction_id: 'MANUAL_UPLOAD'
            },
            ]);

        if (dbError) {
            throw new Error(`Registration save failed: ${dbError.message}`);
        }

        console.log('Registration saved successfully');
        setIsSuccess(true);

    } catch (err) {
        console.error("Submission failed:", err);
        setErrorMsg(err.message);
        setIsSubmitting(false);
    }
  };

  if (isSuccess) {
      return (
          <div className="registration-wrapper">
              <div className="glass-card-ui" style={{ textAlign: 'center', maxWidth: '500px' }}>
                  <h2 style={{ color: '#ffd700', marginBottom: '1rem' }}>Registration Submitted</h2>
                  <p>Welcome to the NAAS Convention.</p>
                  <p>Your registration is pending verification.</p>
                  <p style={{ marginTop: '1rem', color: '#ccc' }}>
                      Please join the WhatsApp group for updates on your registration status.
                  </p>
                  <button 
                    className="cyber-btn" 
                    onClick={() => { 
                        setIsSuccess(false); 
                        setFormData({...formData, fullName: '', healthConcerns: ''}); 
                        setReceiptFile(null);
                    }}
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

            {/* Receipt Upload */}
            <div className="input-container" style={{ marginTop: '1.5rem', border: '1px dashed #ffd700', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ffd700', fontSize: '0.9rem' }}>
                    Upload Proof of Payment (Local Chapter Receipt) *
                </label>
                <input 
                    type="file" 
                    name="receipt" 
                    accept=".pdf, .png, .jpg, .jpeg"
                    onChange={handleChange}
                    required
                    style={{ color: '#fff' }}
                />
                <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Allowed Formats: .pdf, .png, .jpg, .jpeg
                </p>
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