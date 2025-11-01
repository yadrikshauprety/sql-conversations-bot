import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Database, Lock, CreditCard, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProUpgrade = () => {
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock payment processing logic
    toast.success("Payment Successful!", {
      description: "Welcome to Text2SQL.ai Pro! Your plan is now active.",
    });
    // You would integrate with a payment provider here (e.g., Stripe)
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
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="XXXX XXXX XXXX 4242" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                      Confirm Payment ($19/month)
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
