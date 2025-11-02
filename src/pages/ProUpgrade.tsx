// src/pages/ProUpgrade.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Database,
  Lock,
  CreditCard,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf"; // <-- NEW: Import jsPDF

const ProUpgrade = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  // --- NEW: Function to generate the PDF receipt ---
  const generateReceipt = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();
    const last4 = cardNumber.slice(-4);

    // Set Title
    doc.setFontSize(22);
    doc.text("Text2SQL.ai Receipt", 20, 20);

    // Add Date
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 30);
    
    // Billed To
    doc.setFontSize(16);
    doc.text("Billed To:", 20, 45);
    doc.setFontSize(12);
    doc.text(cardName, 20, 52); // Use state

    // Payment Details
    doc.setFontSize(16);
    doc.text("Payment Details:", 20, 65);
    doc.setFontSize(12);
    doc.text("Plan: Pro Plan", 20, 72);
    doc.text("Amount Paid: $19.00", 20, 79);
    doc.text(`Payment Method: Card ending in ${last4}`, 20, 86);

    // Trigger download
    doc.save("Text2SQL-Pro-Receipt.pdf");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to make a payment.");
      }
      const user_id = session.user.id;
      const last4 = cardNumber.slice(-4);
      
      const { error: insertError } = await supabase
        .from("mock_payment_details")
        .insert({
          user_id: user_id,
          card_name: cardName,
          card_number_last4: last4,
          expiry_date: expiry,
        });

      if (insertError) {
        throw insertError;
      }

      // Simulate payment processing
      setTimeout(() => {
        setIsLoading(false);

        // Show success toast
        toast.success("Payment Successful!", {
          description: "Welcome to Text2SQL.ai Pro! Your plan is now active.",
        });

        // --- NEW: Generate the receipt ---
        generateReceipt();

        // Redirect to the chat page after a short delay
        setTimeout(() => {
          navigate("/chat");
        }, 1000); // 1-second delay so the user sees the download start

      }, 2000); // 2-second "processing" delay

    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Payment Failed", {
        description: error.message || "Could not process payment. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Text2SQL.ai</span>
            </Link>
            <Link to="/chat">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Upgrade Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Plan Details Card */}
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Sparkles className="w-6 h-6" /> Pro Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-6">
                  $19<span className="text-lg font-normal text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-4">
                  {[
                    "Unlimited messages per month",
                    "SQL AI generation & optimization",
                    "Support for 12+ database types",
                    "API Access (100 requests/month)",
                    "Priority email support",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-4 border-t border-border flex items-center gap-3 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  Secure payment powered by mock gateway.
                </div>
              </CardContent>
            </Card>

            {/* Payment Form Card */}
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6" /> Payment Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">Enter your card details to complete the upgrade.</p>
              </CardHeader>
              <CardContent>
                {/* Updated form to capture state */}
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="Jane Doe"
                      required
                      disabled={isLoading}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="XXXX XXXX XXXX 4242"
                      required
                      disabled={isLoading}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        required
                        disabled={isLoading}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        required
                        disabled={isLoading}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Confirm Payment ($19/month)"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProUpgrade;