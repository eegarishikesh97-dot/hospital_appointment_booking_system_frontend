import React, { useEffect, useState } from 'react';
import { Activity, CalendarDays, CheckCircle2, Clock3, HeartPulse, Stethoscope, Users, XCircle } from 'lucide-react';

const API = 'http://localhost:8080/api';
const emptyForm = { name: '', email: '', phone: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: '' };

export default function App() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try { const data = await response.json(); message = data.message || message; } catch {}
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  }
  async function refresh() {
    try {
      const [d, p, a] = await Promise.all([request('/doctors'), request('/patients'), request('/appointments')]);
      setDoctors(d); setPatients(p); setAppointments(a);
    } catch (e) { setNotice(`Cannot connect to backend. Start Spring Boot and check MySQL. ${e.message}`); }
  }
  useEffect(() => { refresh(); }, []);
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function book(e) {
    e.preventDefault(); setBusy(true); setNotice('');
    try {
      let patient = patients.find(p => p.email.toLowerCase() === form.email.trim().toLowerCase());
      if (!patient) patient = await request('/patients', { method: 'POST', body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone }) });
      await request('/appointments', { method: 'POST', body: JSON.stringify({
        patientId: patient.id, doctorId: Number(form.doctorId), appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime, reason: form.reason
      }) });
      setNotice('Appointment booked successfully.'); setForm(emptyForm); await refresh();
    } catch (e) { setNotice(e.message || 'Unable to book appointment.'); }
    finally { setBusy(false); }
  }
  async function cancel(id) {
    try { await request(`/appointments/${id}/status?status=CANCELLED`, { method: 'PATCH' }); setNotice('Appointment cancelled.'); await refresh(); }
    catch (e) { setNotice(e.message); }
  }

  const today = new Date().toISOString().slice(0, 10);
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-icon"><HeartPulse size={22}/></span><span>CarePoint<small>HOSPITAL & CLINIC</small></span></a>
      <nav><a href="#doctors">Find a Doctor</a><a href="#booking">Book Appointment</a><a href="#appointments">My Appointments</a></nav>
      <a className="top-cta" href="#booking">Book a Visit <CalendarDays size={16}/></a>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="pulse-dot"/> YOUR HEALTH, OUR PRIORITY</span>
          <h1>Healthcare that<br/>puts <em>you first.</em></h1>
          <p>Book an appointment with trusted specialists in just a few clicks. Quality care, made simpler.</p>
          <div className="hero-actions"><a className="primary-btn" href="#booking">Book an Appointment <span>→</span></a><a className="text-link" href="#doctors">Meet our doctors</a></div>
          <div className="hero-stats"><div><strong>{doctors.length || '—'}</strong><span>Specialists</span></div><i/><div><strong>Easy</strong><span>Online booking</span></div><i/><div><strong>Care</strong><span>That matters</span></div></div>
        </div>
        <div className="hero-art">
          <div className="art-circle circle-one"></div><div className="art-circle circle-two"></div>
          <div className="doctor-illustration"><div className="doctor-head"><div className="hair"></div><div className="face"><i/><i/><b/></div></div><div className="neck"></div><div className="coat"><div className="shirt"></div><div className="stethoscope"></div><div className="pocket"></div></div></div>
          <div className="float-card care-card"><span className="mini-icon"><HeartPulse size={18}/></span><div><b>Care you can trust</b><small>Here for every heartbeat</small></div><CheckCircle2 className="green-check" size={19}/></div>
          <div className="float-card time-card"><span className="clock-icon"><Clock3 size={19}/></span><div><b>Quick booking</b><small>Your time matters</small></div></div>
          <div className="art-caption">COMPASSION IN EVERY CONSULTATION</div>
        </div>
      </section>
      <section className="trust-strip"><div><span><Stethoscope/></span><b>Experienced Specialists</b><small>Care from dedicated professionals</small></div><div><span><CalendarDays/></span><b>Simple Scheduling</b><small>Choose a date and time that works</small></div><div><span><Activity/></span><b>Patient-first Care</b><small>Your wellbeing comes first</small></div></section>

      <section className="section" id="doctors">
        <div className="section-heading"><div><span className="eyebrow">MEET YOUR CARE TEAM</span><h2>Find the right <em>doctor.</em></h2></div><span className="section-note"><Users size={17}/> {doctors.length} doctors available</span></div>
        <div className="doctor-grid">{doctors.map((d, i) => <article className="doctor-card" key={d.id}><div className={`doctor-avatar avatar-${i%3}`}><Stethoscope size={28}/></div><div className="doctor-info"><span className="specialty">{d.specialization}</span><h3>{d.name}</h3><p><Clock3 size={14}/>{d.availability || 'Schedule on request'}</p><div className="doctor-bottom"><strong>₹{Number(d.consultationFee).toFixed(0)} <small>/ consultation</small></strong><a href="#booking" onClick={() => setForm(f => ({...f, doctorId: String(d.id)}))}>Book →</a></div></div></article>)}
        {!doctors.length && <div className="empty-state">Doctor list will appear once the backend is running.</div>}</div>
      </section>

      <section className="booking-section" id="booking">
        <div className="booking-intro"><span className="eyebrow">TAKE THE NEXT STEP</span><h2>Make time for<br/><em>your health.</em></h2><p>Fill in your details and choose your preferred doctor. We'll take it from there.</p><div className="booking-promise"><CheckCircle2 size={19}/><span><b>Simple and convenient</b><small>Book an appointment in less than two minutes.</small></span></div></div>
        <form className="booking-form" onSubmit={book}>
          <div className="form-title"><div><span className="eyebrow">APPOINTMENT REQUEST</span><h3>Book your visit</h3></div><span className="form-icon"><CalendarDays/></span></div>
          {notice && <div className={`notice ${notice.toLowerCase().includes('success') || notice.toLowerCase().includes('cancelled') ? 'success' : ''}`}>{notice}</div>}
          <div className="form-grid">
            <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your full name" required/></label>
            <label>Phone number<input name="phone" value={form.phone} onChange={change} placeholder="+91 98765 43210" required/></label>
            <label className="full">Email address<input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" required/></label>
            <label className="full">Choose a doctor<select name="doctorId" value={form.doctorId} onChange={change} required><option value="">Select a specialist</option>{doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}</select></label>
            <label>Preferred date<input type="date" name="appointmentDate" min={today} value={form.appointmentDate} onChange={change} required/></label>
            <label>Preferred time<input type="time" name="appointmentTime" value={form.appointmentTime} onChange={change} required/></label>
            <label className="full">Reason for visit <span className="optional">(optional)</span><textarea name="reason" value={form.reason} onChange={change} placeholder="Briefly describe what you need help with..." rows="3"/></label>
          </div>
          <button className="submit-btn" disabled={busy || !doctors.length}>{busy ? 'Booking…' : 'Confirm appointment'} <span>→</span></button>
          <p className="privacy-note">By booking, you agree to be contacted about this appointment.</p>
        </form>
      </section>

      <section className="section appointments-section" id="appointments">
        <div className="section-heading"><div><span className="eyebrow">YOUR SCHEDULE</span><h2>Appointment <em>overview.</em></h2></div><span className="section-note"><CalendarDays size={17}/> {appointments.length} total</span></div>
        <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Doctor</th><th>Date & time</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {appointments.map(a=><tr key={a.id}><td><b>{a.patient?.name}</b><small>{a.patient?.email}</small></td><td>{a.doctor?.name}<small>{a.doctor?.specialization}</small></td><td>{a.appointmentDate}<small>{a.appointmentTime}</small></td><td><span className={`status status-${(a.status||'booked').toLowerCase()}`}>{a.status}</span></td><td>{a.status !== 'CANCELLED' && a.status !== 'COMPLETED' ? <button className="cancel-btn" onClick={()=>cancel(a.id)} title="Cancel appointment"><XCircle size={15}/> Cancel</button> : '—'}</td></tr>)}
          {!appointments.length && <tr><td colSpan="5" className="empty-table">No appointments yet. Use the form above to book your first visit.</td></tr>}
        </tbody></table></div>
      </section>
    </main>
    <footer><a className="brand footer-brand" href="#"><span className="brand-icon"><HeartPulse size={20}/></span><span>CarePoint<small>HOSPITAL & CLINIC</small></span></a><span>Thoughtful care. A healthier tomorrow.</span><small>Educational demo project · Not for emergency use</small></footer>
  </div>;
}
