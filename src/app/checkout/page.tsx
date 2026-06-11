
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, Copy, MessageCircle, Loader2, ImageOff, QrCode, Smartphone, Zap, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Product } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import Image from "next/image";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id");
  const { user, loading: userLoading } = useUser();
  const { db } = useFirestore();
  const { toast } = useToast();
  
  const productRef = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return doc(db, 'products', productId);
  }, [db, productId]);
  
  const productDoc = useDoc<Product>(productRef);
  const product = productDoc.data;

  const [isOrdering, setIsOrdering] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [orderId, setOrderId] = useState("");
  
  const [tranId, setTranId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Real-time payment polling
  useEffect(() => {
    if (isOrdered && tranId && clientId && !isPaid) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch('/api/payway/check-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tran_id: tranId,
              client_id: clientId,
              orderId: orderId
            })
          });
          
          if (!res.ok) return;

          const data = await res.json();
          
          if (data.status?.code === '00') {
            const { qr_scanned, payment_approved, finished } = data.meta || {};
            
            // Visual feedback for scanning
            if (qr_scanned && !isScanned) {
              setIsScanned(true);
              toast({ 
                title: "QR Scanned", 
                description: "Payment detected! Please authorize on your phone." 
              });
            }
            
            // Automatic confirmation logic
            if (payment_approved) {
              handlePaymentSuccess();
            } else if (finished && !payment_approved) {
              toast({ 
                title: "Transaction Ended", 
                description: "The payment window has closed or expired.",
                variant: "destructive"
              });
              setIsOrdered(false);
              if (pollingRef.current) clearInterval(pollingRef.current);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2500);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOrdered, tranId, clientId, isPaid, isScanned, orderId, toast]);

  const handlePaymentSuccess = () => {
    if (!db || !orderId) return;
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    setIsPaid(true);
    
    const orderRef = doc(db, 'orders', orderId);
    updateDoc(orderRef, { status: 'paid' })
      .then(() => {
        toast({ title: "Payment Successful!", description: "Your order has been confirmed automatically." });
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({ path: orderRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (!mounted || userLoading || productDoc.loading) return <div className="text-center p-20 flex flex-col items-center gap-4 min-h-screen"><Loader2 className="animate-spin w-8 h-8 text-primary" /><p className="font-headline font-bold uppercase tracking-widest text-xs">Initializing secure session...</p></div>;
  if (!user) return <div className="p-20 text-center flex flex-col items-center gap-4 min-h-screen"><AlertCircle className="w-12 h-12 text-secondary" /><h2 className="text-2xl font-headline font-bold uppercase">LOGIN REQUIRED</h2><p className="text-muted-foreground">Please login to purchase scripts.</p><Button asChild className="bg-primary text-background"><Link href="/auth/login">GO TO LOGIN</Link></Button></div>;
  if (!product) return <div className="p-20 text-center flex flex-col items-center gap-4 min-h-screen"><AlertCircle className="w-12 h-12 text-destructive" /><h2 className="text-2xl font-headline font-bold uppercase">PRODUCT NOT FOUND</h2><p className="text-muted-foreground">The script you are looking for does not exist.</p><Button variant="outline" onClick={() => router.push('/store')}>BACK TO STORE</Button></div>;

  const handleOrder = async () => {
    if (!db || !user || !product) return;

    setIsOrdering(true);
    const newOrderId = "MK-" + Math.floor(100000 + Math.random() * 900000);
    const orderRef = doc(db, 'orders', newOrderId);

    const orderData = {
      id: newOrderId,
      customerId: user.uid,
      customerEmail: user.email,
      productId: product.id,
      productName: product.name,
      amount: product.price,
      status: 'pending',
      createdAt: Date.now()
    };

    try {
      const qrRes = await fetch('/api/payway/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: product.price.toFixed(2) })
      });
      
      const qrData = await qrRes.json();

      if (qrData.status?.code === "00") {
        setTranId(qrData.status.tran_id);
        setClientId(qrData.client_id);
        setQrImage(qrData.download_qr);
        setQrString(qrData.qr_string);
        
        setDoc(orderRef, orderData)
          .catch(async () => {
             const permissionError = new FirestorePermissionError({ path: orderRef.path, operation: 'create', requestResourceData: orderData });
             errorEmitter.emit('permission-error', permissionError);
          });
        
        setOrderId(newOrderId);
        setIsOrdered(true);
        toast({ title: "Order Created", description: "Secure KHQR generated successfully." });
      } else {
        toast({ 
          title: "Gateway Error", 
          description: qrData.status?.message || "Could not generate KHQR. Please try again.", 
          variant: "destructive" 
        });
      }
    } catch (err: any) {
      toast({ 
        title: "Connection Failed", 
        description: "Could not connect to the payment gateway.", 
        variant: "destructive" 
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  if (isPaid) {
    return (
      <div className="max-w-2xl mx-auto glass p-10 rounded-3xl text-center border-primary/50">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8 border border-green-500 animate-pulse-cyan">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="font-headline text-3xl font-bold mb-4 uppercase text-white">PAYMENT <span className="text-primary">VERIFIED</span></h2>
        <p className="text-muted-foreground mb-8 text-lg font-medium">
          Thank you! Your payment for <span className="text-white font-bold">{product.name}</span> was successful.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button asChild size="lg" className="h-14 bg-primary text-background font-headline hover:bg-primary/90 neon-glow">
            <Link href="/account/downloads">DOWNLOAD NOW</Link>
          </Button>
          <Button variant="outline" size="lg" className="h-14 font-headline border-white/10 hover:border-primary" onClick={() => router.push('/account/orders')}>
            VIEW ORDER HISTORY
          </Button>
        </div>
      </div>
    );
  }

  if (isOrdered) {
    return (
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 glass p-8 rounded-3xl text-center border-primary/20">
          <h2 className="font-headline text-2xl font-bold mb-6 uppercase text-primary tracking-widest flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6" /> SCAN TO PAY
          </h2>
          <div className="bg-white p-5 rounded-3xl mb-8 inline-block shadow-[0_0_50px_rgba(0,229,255,0.15)] relative group">
            {qrImage ? (
              <img src={qrImage} alt="KHQR Payment Code" className="w-72 h-72 rounded-xl" />
            ) : (
              <div className="w-72 h-72 flex items-center justify-center bg-black/5 rounded-xl">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            )}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-3xl pointer-events-none" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Total Amount Due</p>
            <p className="text-5xl font-headline font-bold text-white neon-text">${product.price.toFixed(2)}</p>
          </div>
          
          <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Open your mobile banking app (ABA, Wing, etc.) and scan the KHQR code above. The page will refresh automatically once paid.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-6 rounded-2xl border-secondary/20 bg-secondary/5">
            <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2 text-secondary">
              <Smartphone className="w-5 h-5" /> PAY VIA MOBILE
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Browsing on your phone? Tap below to launch your banking app and pay instantly.
            </p>
            <Button asChild size="lg" className="w-full h-14 bg-secondary text-white hover:bg-secondary/90 shadow-[0_4px_0_0_rgba(209,0,255,0.3)] hover:translate-y-[2px] hover:shadow-none transition-all">
              <a href={qrString || "#"} target="_blank">PAY NOW VIA ABA MOBILE</a>
            </Button>
          </div>

          <div className="glass p-6 rounded-2xl border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transaction Ref</span>
              <button onClick={() => copyToClipboard(orderId)} className="text-primary hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold">
                <Copy className="w-3 h-3" /> COPY ID
              </button>
            </div>
            <p className="text-xl font-headline font-bold text-white tracking-widest">{orderId}</p>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-500 ${isScanned ? 'bg-green-500/10 border-green-500/50' : 'bg-primary/5 border-primary/10'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isScanned ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                {isScanned ? <Check className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Live Status</p>
                <p className={`text-xs font-bold uppercase ${isScanned ? 'text-green-400' : 'text-primary'}`}>
                  {isScanned ? 'QR CODE SCANNED - AUTHORIZING...' : 'WAITING FOR SCAN...'}
                </p>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest" onClick={() => router.push('/account/orders')}>
            I'll finish this later
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="glass p-8 rounded-3xl space-y-8 border-white/5">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-wider">ORDER <span className="text-primary">SUMMARY</span></h2>
        <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
          <div className="w-24 h-24 relative rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
            {product.previewImageUrl ? (
              <Image 
                src={product.previewImageUrl} 
                alt={product.name} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                data-ai-hint="gaming interface"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground/20">
                <ImageOff className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] font-bold border-primary/30 text-primary uppercase">{product.framework}</Badge>
              <span className="text-[9px] font-bold text-muted-foreground uppercase">{product.category}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex justify-between text-muted-foreground font-medium">
            <span>Subtotal</span>
            <span className="text-white">${product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground font-medium">
            <span>Processing Fee</span>
            <span className="text-white">$0.00</span>
          </div>
          <div className="pt-6 flex justify-between font-headline text-3xl font-bold text-primary neon-text">
            <span>TOTAL</span>
            <span>${product.price.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border-primary/30 bg-primary/5">
        <h2 className="font-headline text-2xl font-bold mb-8 flex items-center gap-3 uppercase tracking-wider">
          <CreditCard className="w-6 h-6 text-primary" /> SECURE PAYMENT
        </h2>
        
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-5 p-5 bg-primary/20 border-2 border-primary rounded-2xl cursor-default group transition-all relative overflow-hidden shadow-[0_0_20px_rgba(0,229,255,0.1) ]">
            <span className="text-3xl">🇰🇭</span>
            <div className="flex flex-col">
              <span className="font-bold text-white uppercase tracking-wider">ABA Unified KHQR</span>
              <span className="text-[9px] text-primary-foreground bg-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest mt-1 inline-block w-fit">Fastest Delivery</span>
            </div>
            <CheckCircle className="ml-auto w-6 h-6 text-primary" />
          </div>

          <div className="flex items-center gap-5 p-5 bg-black/40 border border-white/10 rounded-2xl opacity-40 grayscale cursor-not-allowed group">
            <span className="text-3xl">💳</span>
            <div className="flex flex-col">
              <span className="font-bold uppercase tracking-wider">Card Payment</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl mb-10 text-center">
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            Your payment is processed via Mekong Secure Gateway. Resources are delivered instantly after confirmation.
          </p>
        </div>

        <Button onClick={handleOrder} disabled={isOrdering} size="lg" className="w-full h-16 bg-primary text-background font-headline text-lg hover:bg-primary/90 neon-glow transition-all uppercase tracking-widest">
          {isOrdering ? <Loader2 className="w-6 h-6 animate-spin" /> : 'CONFIRM & PAY'}
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 cyber-grid">
      <Navbar />
      <div className="container mx-auto px-4">
        <Suspense fallback={<div className="text-center p-20 flex flex-col items-center gap-4 min-h-screen"><Loader2 className="animate-spin w-8 h-8 text-primary" /><p className="font-headline font-bold uppercase tracking-widest text-xs">Loading Secure Checkout...</p></div>}>
          <CheckoutContent />
        </Suspense>
      </div>
    </main>
  );
}
