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
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client

const ProUpgrade = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Add state for each form field
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState(""); // We won't save this, but we need state for the input

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to make a payment.");
      }
      const user_id = session.user.id;

      // 2. Get the last 4 digits of the card (NEVER store the full number)
      const last4 = cardNumber.slice(-4);
      
      // 3. Save the *mock* data to Supabase
      const { error: insertError } = await supabase
        .from("mock_payment_details")
        .insert({
          user_id: user_id,
          card_name: cardName,
          card_number_last4: last4,
          expiry_date: expiry,
          // DO NOT SAVE THE CVC
        });

      if (insertError) {
        throw insertError; // Throw error to be caught by catch block
      }

      // 4. Simulate payment processing (as before)
      setTimeout(() => {
        setIsLoading(false);

        // Show success toast
        toast.success("Payment Successful!", {
          description: "Welcome to Text2SQL.ai Pro! Your plan is now active.",
        });

        // Redirect to the chat page
        navigate("/chat");
      }, 2000);

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
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Upgrade to Pro</h1>
              <p className="text-lg text-muted-foreground">Unlock unlimited queries and priority support for $19/month.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
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
        </div>
      </section>
    </div>
  );
};

export default ProUpgrade;