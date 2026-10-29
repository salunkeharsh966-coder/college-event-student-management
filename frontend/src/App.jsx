import { useCallback, useEffect, useState } from 'react';
import {
  Activity, CalendarDays, CheckCircle2, GraduationCap, LayoutDashboard,
  Plus, RefreshCw, Search, Trash2, Users, X
} from 'lucide-react';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

const blankStudent = { name: '', email: '', course: 'B.Sc. Computer Science', year: 'Third Year' };
const blankEvent = { title: '', description: '', venue: '', eventDate: '' };

export default function App() {
  const [section, setSection] = useState('Dashboard');
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalEvents: 0, totalRegistrations: 0 });
  const [studentForm, setStudentForm] = useState(blankStudent);
  const [eventForm, setEventForm] = useState(blankEvent);
  const [registrationForm, setRegistrationForm] = useState({ studentId: '', eventId: '' });
  const [studentSearch, setStudentSearch] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, e, r, d] = await Promise.all([
        request('/students'), request('/events'), request('/registrations'), request('/dashboard')
      ]);
      setStudents(s); setEvents(e); setRegistrations(r); setStats(d);
      setNotice({ type: '', text: '' });
    } catch (err) {
      setNotice({ type: 'error', text: `${err.message}. Check that Spring Boot and MySQL are running.` });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function perform(action, successText) {
    try {
      await action();
      setNotice({ type: 'success', text: successText });
      await loadAll();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  }

  async function addStudent(e) {
    e.preventDefault();
    await perform(async () => {
      await request('/students', { method: 'POST', body: JSON.stringify(studentForm) });
      setStudentForm(blankStudent);
    }, 'Student added successfully.');
  }

  async function addEvent(e) {
    e.preventDefault();
    await perform(async () => {
      await request('/events', { method: 'POST', body: JSON.stringify(eventForm) });
      setEventForm(blankEvent);
    }, 'Event created successfully.');
  }

  async function registerStudent(e) {
    e.preventDefault();
    await perform(async () => {
      await request('/registrations', {
        method: 'POST',
        body: JSON.stringify({
          studentId: Number(registrationForm.studentId),
          eventId: Number(registrationForm.eventId)
        })
      });
      setRegistrationForm({ studentId: '', eventId: '' });
    }, 'Student registered for the event.');
  }

  const nav = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Students', icon: Users },
    { name: 'Events', icon: CalendarDays },
    { name: 'Registrations', icon: CheckCircle2 }
  ];
  const filteredStudents = students.filter(s =>
    `${s.name} ${s.email} ${s.course || ''}`.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><GraduationCap size={24}/></div><div><strong>CampusConnect</strong><span>COLLEGE PORTAL</span></div></div>
        <div className="nav-label">WORKSPACE</div>
        <nav>{nav.map(item => {
          const Icon = item.icon;
          return <button key={item.name} className={`nav-item ${section === item.name ? 'active' : ''}`} onClick={() => setSection(item.name)}><Icon size={18}/><span>{item.name}</span>{section === item.name && <span className="nav-dot"/>}</button>;
        })}</nav>
        <div className="sidebar-bottom"><div className="status-dot"/><div><strong>Local demo</strong><span>Spring Boot API</span></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">CampusConnect <span>/</span> <b>{section}</b></div>
          <div className="top-actions"><span className="live-indicator"><i/> System ready</span><button className="icon-button" onClick={loadAll} title="Refresh data"><RefreshCw size={17}/></button><div className="avatar">HS</div></div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow">COLLEGE ADMINISTRATION</div><h1>{section === 'Dashboard' ? 'Overview' : section}</h1><p>{section === 'Dashboard' ? 'Manage students, campus events and registrations in one place.' : `Manage your college ${section.toLowerCase()} records.`}</p></div>
            <button className="button secondary" onClick={loadAll}><RefreshCw size={16}/> Refresh</button>
          </div>

          {notice.text && <div className={`notice ${notice.type}`}><span>{notice.text}</span><button onClick={() => setNotice({ type: '', text: '' })}><X size={16}/></button></div>}

          {section === 'Dashboard' && <>
            <div className="stat-grid">
              <StatCard title="Total Students" value={stats.totalStudents} note="Registered in system" icon={<Users/>} tone="blue"/>
              <StatCard title="Campus Events" value={stats.totalEvents} note="Events created" icon={<CalendarDays/>} tone="purple"/>
              <StatCard title="Registrations" value={stats.totalRegistrations} note="Event sign-ups" icon={<CheckCircle2/>} tone="green"/>
            </div>
            <div className="content-grid">
              <section className="panel"><div className="panel-heading"><div><h2>Recent students</h2><p>Latest student records</p></div><button className="text-button" onClick={() => setSection('Students')}>View all →</button></div>
                {students.length ? <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>COURSE</th><th>YEAR</th></tr></thead><tbody>{students.slice(-5).reverse().map(s => <tr key={s.id}><td><div className="person"><div className="mini-avatar">{initials(s.name)}</div><div><strong>{s.name}</strong><small>{s.email}</small></div></div></td><td>{s.course || '—'}</td><td>{s.year || '—'}</td></tr>)}</tbody></table></div> : <Empty text="No students yet. Add your first student from Students."/>}
              </section>
              <section className="panel"><div className="panel-heading"><div><h2>Upcoming events</h2><p>Campus calendar</p></div><button className="text-button" onClick={() => setSection('Events')}>View all →</button></div>
                {events.length ? <div className="event-list">{events.slice().sort((a,b) => (a.eventDate || '').localeCompare(b.eventDate || '')).slice(0,5).map(ev => <div className="event-row" key={ev.id}><div className="date-tile"><strong>{ev.eventDate ? new Date(`${ev.eventDate}T00:00:00`).getDate() : '—'}</strong><span>{ev.eventDate ? new Date(`${ev.eventDate}T00:00:00`).toLocaleString('en',{month:'short'}).toUpperCase() : 'DATE'}</span></div><div className="event-info"><strong>{ev.title}</strong><span>{ev.venue || 'Venue not set'}</span></div><span className="event-tag">EVENT</span></div>)}</div> : <Empty text="No events yet. Create your first campus event."/>}
              </section>
            </div>
            <section className="panel quick-panel"><div><div className="quick-icon"><Activity size={20}/></div><div><h2>Quick actions</h2><p>Keep your campus records up to date.</p></div></div><div className="quick-actions"><button className="button primary" onClick={() => setSection('Students')}><Plus size={16}/> Add student</button><button className="button secondary" onClick={() => setSection('Events')}><Plus size={16}/> Create event</button><button className="button secondary" onClick={() => setSection('Registrations')}><CheckCircle2 size={16}/> Register student</button></div></section>
          </>}

          {section === 'Students' && <div className="single-grid">
            <section className="panel form-panel"><div className="panel-heading"><div><h2>Add a student</h2><p>Enter the student's academic details</p></div><span className="step-badge">NEW</span></div>
              <form onSubmit={addStudent} className="form-stack"><Field label="Full name"><input required value={studentForm.name} onChange={e => setStudentForm({...studentForm,name:e.target.value})} placeholder="e.g. Aditi Sharma"/></Field><Field label="Email address"><input type="email" required value={studentForm.email} onChange={e => setStudentForm({...studentForm,email:e.target.value})} placeholder="student@example.com"/></Field><Field label="Course"><input value={studentForm.course} onChange={e => setStudentForm({...studentForm,course:e.target.value})} placeholder="e.g. B.Sc. Computer Science"/></Field><Field label="Academic year"><select value={studentForm.year} onChange={e => setStudentForm({...studentForm,year:e.target.value})}><option>First Year</option><option>Second Year</option><option>Third Year</option><option>Other</option></select></Field><button className="button primary full" type="submit"><Plus size={16}/> Save student</button></form>
            </section>
            <section className="panel"><div className="panel-heading"><div><h2>Student directory</h2><p>{students.length} student record(s)</p></div></div><div className="search-box"><Search size={17}/><input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Search by name, email or course..."/></div>
              {filteredStudents.length ? <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>COURSE / YEAR</th><th></th></tr></thead><tbody>{filteredStudents.map(s => <tr key={s.id}><td><div className="person"><div className="mini-avatar">{initials(s.name)}</div><div><strong>{s.name}</strong><small>{s.email}</small></div></div></td><td>{s.course || '—'}<small className="cell-sub">{s.year || '—'}</small></td><td><button className="delete-button" title="Delete student" onClick={() => {if(confirm(`Delete ${s.name}?`)) perform(() => request(`/students/${s.id}`,{method:'DELETE'}),'Student deleted.')}}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div> : <Empty text="No matching students. Add one using the form."/>}
            </section>
          </div>}

          {section === 'Events' && <div className="single-grid">
            <section className="panel form-panel"><div className="panel-heading"><div><h2>Create an event</h2><p>Add an activity to the campus calendar</p></div><span className="step-badge">NEW</span></div>
              <form onSubmit={addEvent} className="form-stack"><Field label="Event title"><input required value={eventForm.title} onChange={e => setEventForm({...eventForm,title:e.target.value})} placeholder="e.g. Tech Fest 2026"/></Field><Field label="Description"><textarea rows="3" value={eventForm.description} onChange={e => setEventForm({...eventForm,description:e.target.value})} placeholder="A short description of the event"/></Field><Field label="Event date"><input type="date" value={eventForm.eventDate} onChange={e => setEventForm({...eventForm,eventDate:e.target.value})}/></Field><Field label="Venue"><input value={eventForm.venue} onChange={e => setEventForm({...eventForm,venue:e.target.value})} placeholder="e.g. College Auditorium"/></Field><button className="button primary full" type="submit"><Plus size={16}/> Create event</button></form>
            </section>
            <section className="panel"><div className="panel-heading"><div><h2>Campus events</h2><p>{events.length} event(s) created</p></div></div>
              {events.length ? <div className="event-list roomy">{events.slice().sort((a,b) => (a.eventDate || '').localeCompare(b.eventDate || '')).map(ev => <div className="event-card" key={ev.id}><div className="event-card-top"><div className="event-symbol"><CalendarDays size={21}/></div><button className="delete-button" title="Delete event" onClick={() => {if(confirm(`Delete ${ev.title}?`)) perform(() => request(`/events/${ev.id}`,{method:'DELETE'}),'Event deleted.')}}><Trash2 size={16}/></button></div><h3>{ev.title}</h3><p>{ev.description || 'No description provided.'}</p><div className="event-meta"><span><CalendarDays size={14}/>{ev.eventDate || 'Date not set'}</span><span>⌖ {ev.venue || 'Venue not set'}</span></div></div>)}</div> : <Empty text="No events yet. Create an event using the form."/>}
            </section>
          </div>}

          {section === 'Registrations' && <div className="registration-layout">
            <section className="panel form-panel"><div className="panel-heading"><div><h2>Register a student</h2><p>Choose a student and an event</p></div></div>
              {(!students.length || !events.length) && <div className="helper-box">First add at least one student and one event. Then return here to register.</div>}
              <form onSubmit={registerStudent} className="form-stack"><Field label="Select student"><select required value={registrationForm.studentId} onChange={e => setRegistrationForm({...registrationForm,studentId:e.target.value})}><option value="">Choose a student...</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.email}</option>)}</select></Field><Field label="Select event"><select required value={registrationForm.eventId} onChange={e => setRegistrationForm({...registrationForm,eventId:e.target.value})}><option value="">Choose an event...</option>{events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}</select></Field><button className="button primary full" disabled={!students.length || !events.length} type="submit"><CheckCircle2 size={16}/> Confirm registration</button></form>
            </section>
            <section className="panel"><div className="panel-heading"><div><h2>Registration records</h2><p>{registrations.length} registration(s)</p></div></div>
              {registrations.length ? <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>EVENT</th><th>REGISTERED ON</th></tr></thead><tbody>{registrations.map(r => <tr key={r.id}><td><div className="person"><div className="mini-avatar">{initials(r.student?.name || '?')}</div><div><strong>{r.student?.name || 'Unknown'}</strong><small>{r.student?.email || ''}</small></div></div></td><td><strong>{r.event?.title || 'Unknown event'}</strong><small className="cell-sub">{r.event?.venue || ''}</small></td><td>{r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div> : <Empty text="No registrations yet. Register a student for an event."/>}
            </section>
          </div>}

          <footer>CampusConnect <span>•</span> College Event & Student Management System <span>•</span> Academic Mini Project</footer>
        </div>
      </main>
      {loading && <div className="loading-pill"><RefreshCw size={14} className="spin"/> Syncing data…</div>}
    </div>
  );
}

function StatCard({ title, value, note, icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-title">{title}</div><div className="stat-value">{value}</div><div className="stat-note"><span className="trend">↗</span> {note}</div></div>;
}
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Empty({ text }) { return <div className="empty-state"><div className="empty-icon"><CalendarDays size={22}/></div><p>{text}</p></div>; }
function initials(name = '') { return name.split(' ').filter(Boolean).slice(0,2).map(part => part[0].toUpperCase()).join('') || '?'; }
