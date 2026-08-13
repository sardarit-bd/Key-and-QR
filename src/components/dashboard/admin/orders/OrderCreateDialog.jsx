'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { adminProductsService } from '@/services/dashboard-service/admin-products.service';
import QuantityInput from '@/components/ui/QuantityInput';

const MARKETPLACE_OPTIONS = [
  { value: 'etsy', label: 'Etsy' },
  { value: 'tiktok', label: 'TikTok Shop' },
  { value: 'manual', label: 'Offline / Manual' },
  { value: 'other', label: 'Other Marketplace' },
];

export default function OrderCreateDialog({ open, onOpenChange, onSave, isLoading = false }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderSource, setOrderSource] = useState('manual');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Address
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  const [error, setError] = useState('');

  // Fetch active products with 5 minute staleTime to avoid lagging opening state
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products', 'manual-order-list'],
    queryFn: () => adminProductsService.getProducts({ limit: 100, status: 'active' }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.data || [];

  useEffect(() => {
    if (open) {
      setFullName('');
      setEmail('');
      setPhone('');
      setOrderSource('manual');
      setProductId('');
      setQuantity(1);
      setAddress('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('United States');
      setError('');
    }
  }, [open]);

  const validate = () => {
    if (!fullName.trim()) return setError('Customer Name is required');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError('A valid email is required');
    if (!productId) return setError('Please select a product');
    if (!quantity || quantity < 1) return setError('Quantity must be at least 1');
    if (!address.trim()) return setError('Shipping Address is required');
    if (!city.trim()) return setError('City is required');
    if (!state.trim()) return setError('State is required');
    if (!postalCode.trim()) return setError('ZIP/Postal Code is required');
    if (!country.trim()) return setError('Country is required');
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      orderSource,
      productId,
      quantity: Number(quantity),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto font-sans p-6 rounded-2xl border border-border bg-popover text-popover-foreground">
        {open && (
          <>
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">Create External/Manual Order</DialogTitle>
                  <DialogDescription className="text-xs text-foreground-tertiary">Record a sale originating outside the website (e.g. Etsy, TikTok Shop).</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary border-b border-border/40 pb-1">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">Customer Name</label>
                    <Input
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setError(''); }}
                      placeholder="Jane Doe"
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="jane@example.com"
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">Phone Number (Optional)</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">Order Source / Marketplace</label>
                    <Select value={orderSource} onValueChange={setOrderSource}>
                      <SelectTrigger className="h-10 text-sm rounded-lg">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARKETPLACE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary border-b border-border/40 pb-1">Product Selection</h4>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">Product</label>
                    <Select value={productId} onValueChange={(val) => { setProductId(val); setError(''); }}>
                      <SelectTrigger className="h-10 text-sm rounded-lg">
                        <SelectValue placeholder={loadingProducts ? "Loading Products..." : "Select Product"} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p._id} value={p._id} className="text-sm">
                            {p.name} (${Number(p.price).toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">Quantity</label>
                    <div>
                      <QuantityInput
                        value={quantity}
                        onChange={(val) => { setQuantity(val); setError(''); }}
                        min={1}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary border-b border-border/40 pb-1">Shipping Address</h4>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground-secondary">Address Line</label>
                  <Input
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setError(''); }}
                    placeholder="123 Main St, Apt 4B"
                    className="h-10 text-sm rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">City</label>
                    <Input
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setError(''); }}
                      placeholder="Springfield"
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">State / Province</label>
                    <Input
                      value={state}
                      onChange={(e) => { setState(e.target.value); setError(''); }}
                      placeholder="IL"
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">ZIP / Postal Code</label>
                    <Input
                      value={postalCode}
                      onChange={(e) => { setPostalCode(e.target.value); setError(''); }}
                      placeholder="62701"
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground-secondary">Country</label>
                    <Input
                      value={country}
                      onChange={(e) => { setCountry(e.target.value); setError(''); }}
                      placeholder="United States"
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>

            <DialogFooter className="mt-6 border-t border-border/40 pt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="h-10 px-4 rounded-lg cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="h-10 px-5 rounded-lg flex items-center justify-center gap-2 cursor-pointer">
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating...
                  </>
                ) : 'Create Order'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
