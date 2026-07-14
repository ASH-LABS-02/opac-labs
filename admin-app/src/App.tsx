import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

const ADMIN_PASSWORD = 'opacadmin123';
const CATEGORIES = ['arduino','esp','sensors','cables','essentials','bestselling-kits','bestseller-products','student-projects'];

type Product = {
  id: number; name: string; category: string; price: number;
  originalPrice: number | null; discount: number; image: string;
  description: string; specs: string[]; featured: boolean; stock: string;
  _new?: boolean;
};

const td: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'middle', fontSize: 13 };
const inp: React.CSSProperties = { padding: '6px 8px', border: '1px solid #ddd', fontSize: 13, width: 90, outline: 'none' };
const btn: React.CSSProperties = { padding: '6px 12px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 };

function toDirectImageUrl(url: string): string {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) onAuth();
    else { setErr(true); setPw(''); }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
      <form onSubmit={submit} style={{ background: '#fff', padding: '40px', border: '1px solid #e5e5e5', width: 320 }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>Admin Access</h2>
        <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
          placeholder="Enter admin password" autoFocus
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${err ? '#e55' : '#ddd'}`, fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
        {err && <p style={{ color: '#e55', fontSize: 13, margin: '0 0 12px' }}>Incorrect password</p>}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Enter</button>
      </form>
    </div>
  );
}

function ProductRow({ product, onSave }: { product: Product; onSave: (p: Product) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState({ ...product });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (field: string, val: string | number | null) => setData(d => ({ ...d, [field]: val }));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...data, image: toDirectImageUrl(data.image) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(false);
  };

  return (
    <tr style={{ borderBottom: '1px solid #f0f0f0', background: editing ? '#fffef5' : '#fff' }}>
      <td style={td}>{product.id}</td>
      <td style={{ ...td, maxWidth: 80 }}>
        <img src={data.image || ''} alt={data.name} style={{ width: 60, height: 60, objectFit: 'contain', border: '1px solid #eee' }} />
      </td>
      <td style={td}>
        <span style={{ fontWeight: 500, fontSize: 13 }}>{product.name}</span><br />
        <span style={{ fontSize: 11, color: '#999' }}>{product.category}</span>
      </td>
      <td style={td}>{editing ? <input type="number" value={data.price} onChange={e => set('price', Number(e.target.value))} style={inp} /> : <span style={{ fontWeight: 600 }}>₹{data.price}</span>}</td>
      <td style={td}>{editing
        ? <input type="number" value={data.originalPrice ?? ''} onChange={e => set('originalPrice', e.target.value ? Number(e.target.value) : null)} style={inp} placeholder="—" />
        : <span style={{ color: '#999', textDecoration: 'line-through', fontSize: 12 }}>{data.originalPrice ? `₹${data.originalPrice}` : '—'}</span>}
      </td>
      <td style={td}>{editing
        ? <input type="number" value={data.discount} onChange={e => set('discount', Number(e.target.value))} style={{ ...inp, width: 60 }} />
        : <span style={{ background: data.discount > 0 ? '#111' : '#eee', color: data.discount > 0 ? '#fff' : '#999', padding: '2px 8px', fontSize: 11, borderRadius: 2 }}>{data.discount > 0 ? `${data.discount}%` : '—'}</span>}
      </td>
      <td style={{ ...td, maxWidth: 260 }}>{editing
        ? <input value={data.image} onChange={e => set('image', e.target.value)} style={{ ...inp, width: '100%', fontSize: 11 }} placeholder="Image URL" />
        : <span style={{ fontSize: 11, color: '#666', wordBreak: 'break-all' }}>{data.image.slice(0, 50)}{data.image.length > 50 ? '…' : ''}</span>}
      </td>
      <td style={td}>
        {editing ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave} disabled={saving} style={{ ...btn, background: '#111', color: '#fff' }}>{saving ? '…' : 'Save'}</button>
            <button onClick={() => { setData({ ...product }); setEditing(false); }} style={btn}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={btn}>{saved ? '✓ Saved' : 'Edit'}</button>
        )}
      </td>
    </tr>
  );
}

const emptyForm = { name: '', category: 'arduino', price: '', originalPrice: '', discount: '0', image: '', description: '', specs: '', featured: false, stock: 'in-stock' };

function AddProductPanel({ onAdd }: { onAdd: (p: Omit<Product, 'id'>) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image) return;
    setSaving(true);
    await onAdd({
      name: form.name, category: form.category,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      discount: Number(form.discount),
      image: toDirectImageUrl(form.image),
      description: form.description,
      specs: form.specs.split('\n').map(s => s.trim()).filter(Boolean),
      featured: form.featured, stock: form.stock,
    });
    setSaving(false); setDone(true);
    setForm({ ...emptyForm });
    setTimeout(() => setDone(false), 3000);
  };

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555' }}>{label}</label>
      <input type={type} value={form[key as keyof typeof emptyForm] as string}
        onChange={e => set(key, e.target.value)} placeholder={placeholder}
        style={{ padding: '8px 10px', border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
    </div>
  );

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', marginBottom: 24 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
        <span>+ Add New Product</span>
        <span style={{ fontSize: 18, color: '#999' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <form onSubmit={handleSubmit} style={{ padding: '0 20px 24px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 20 }}>
            {field('Product Name *', 'name', 'text', 'e.g. Arduino Uno R3')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555' }}>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                style={{ padding: '8px 10px', border: '1px solid #ddd', fontSize: 13, outline: 'none', background: '#fff' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {field('Price (₹) *', 'price', 'number', '499')}
            {field('Original Price (₹)', 'originalPrice', 'number', '599')}
            {field('Discount %', 'discount', 'number', '0')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555' }}>Stock</label>
              <select value={form.stock} onChange={e => set('stock', e.target.value)}
                style={{ padding: '8px 10px', border: '1px solid #ddd', fontSize: 13, outline: 'none', background: '#fff' }}>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555' }}>Image URL *</label>
              <input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..."
                style={{ padding: '8px 10px', border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
              {form.image && <img src={form.image} alt="preview" style={{ marginTop: 8, width: 80, height: 80, objectFit: 'contain', border: '1px solid #eee' }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555' }}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                style={{ padding: '8px 10px', border: '1px solid #ddd', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555' }}>Specs (one per line)</label>
              <textarea value={form.specs} onChange={e => set('specs', e.target.value)} rows={3} placeholder={'ATmega328P\n14 digital pins'}
                style={{ padding: '8px 10px', border: '1px solid #ddd', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              Featured product
            </label>
            <button type="submit" disabled={saving}
              style={{ padding: '10px 28px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {saving ? 'Adding…' : done ? '✓ Added!' : 'Add Product'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tab, setTab] = useState<'products' | 'add'>('products');

  useEffect(() => {
    if (!authed) return;
    getDocs(collection(db, 'products')).then(snap => {
      const result: Product[] = [];
      snap.forEach(d => result.push({ ...d.data() as Product, id: Number(d.id) }));
      result.sort((a, b) => a.id - b.id);
      setProducts(result);
    }).catch(() => {});
  }, [authed]);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const saveProduct = async (p: Product) => {
    await setDoc(doc(db, 'products', String(p.id)), p);
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  };

  const addProduct = async (p: Omit<Product, 'id'>) => {
    const maxId = Math.max(...products.map(x => x.id), 100);
    const newId = maxId + 1;
    const newProduct = { ...p, id: newId };
    await setDoc(doc(db, 'products', String(newId)), newProduct);
    setProducts(prev => [...prev, newProduct]);
  };

  const allCategories = ['all', ...CATEGORIES];
  const visible = products.filter(p =>
    (categoryFilter === 'all' || p.category === categoryFilter) &&
    (filter === '' || p.name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>OPAC Product Admin</h1>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>Manage products, prices, images and add new items.</p>
          </div>
          <span style={{ fontSize: 13, color: '#999', background: '#fff', border: '1px solid #e5e5e5', padding: '6px 14px' }}>{products.length} total products</span>
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #e5e5e5' }}>
          {(['products', 'add'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 24px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                borderBottom: tab === t ? '2px solid #111' : '2px solid transparent',
                marginBottom: -2, color: tab === t ? '#111' : '#888' }}>
              {t === 'products' ? 'All Products' : '+ Add Product'}
            </button>
          ))}
        </div>

        {tab === 'add' && <AddProductPanel onAdd={addProduct} />}

        {tab === 'products' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search products…"
                style={{ padding: '8px 12px', border: '1px solid #ddd', fontSize: 13, width: 220, outline: 'none', background: '#fff' }} />
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #ddd', fontSize: 13, background: '#fff', outline: 'none' }}>
                {allCategories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
              </select>
              <span style={{ alignSelf: 'center', fontSize: 13, color: '#999' }}>{visible.length} shown</span>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e5e5e5', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e5e5e5' }}>
                    {['ID', 'Image', 'Product', 'Price', 'Original', 'Discount', 'Image URL', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map(p => <ProductRow key={p.id} product={p} onSave={saveProduct} />)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
