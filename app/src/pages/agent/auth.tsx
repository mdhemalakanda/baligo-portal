import * as React from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Hourglass,
  LifeBuoy,
  LogIn,
  Mail,
  MailX,
  UserRoundX,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandLogo } from "@/components/shared/brand";

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function CenterCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full max-w-sm ${className}`}>{children}</div>;
}

function BackToSignIn() {
  return (
    <Link
      to="/agent/sign-in"
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      Back to sign in
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

export function SignIn() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [showErrorDemo, setShowErrorDemo] = React.useState(false);
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");

  function signIn() {
    toast("Sign in simulated (demo — authentication is not implemented)");
  }

  function sendReset() {
    setForgotOpen(false);
    toast.success("Reset link sent (demo — nothing was sent)");
  }

  return (
    <CenterCard>
      <Card className="shadow-md">
        <CardHeader className="items-center text-center">
          <div className="mb-1 flex justify-center">
            <BrandLogo subtitle="Agent portal" />
          </div>
          <CardTitle className="mt-2">Agent sign in</CardTitle>
          <CardDescription>
            Access your quotations and hotel rates. Demo environment — no real accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {showErrorDemo && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">Invalid email or password.</span> This is a demo
                error state — no credentials are checked.
              </span>
            </div>
          )}

          <div className="grid gap-1.5">
            <label htmlFor="si-email" className="text-[13px] font-medium">
              Email
            </label>
            <Input
              id="si-email"
              type="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="si-password" className="text-[13px] font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="si-password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <label
            htmlFor="si-remember"
            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
          >
            <Checkbox
              id="si-remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
            />
            Remember me
          </label>

          <Button className="w-full" onClick={signIn}>
            <LogIn aria-hidden="true" /> Sign in
          </Button>

          <button
            type="button"
            onClick={() => setShowErrorDemo((v) => !v)}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline cursor-pointer"
          >
            {showErrorDemo ? "Hide the error state" : "Try the error state"}
          </button>
        </CardContent>
        <CardFooter className="flex-col gap-2 border-t text-[13px] text-muted-foreground">
          <span>
            New agency?{" "}
            <span className="font-medium text-foreground">Your account is created by Baligo.</span>
          </span>
          <span className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <Link to="/agent/pending" className="hover:text-foreground hover:underline">
              Pending approval?
            </Link>
            <Link to="/agent/deactivated" className="hover:text-foreground hover:underline">
              Deactivated?
            </Link>
          </span>
        </CardFooter>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo environment — all data is sample data.
      </p>

      {/* Forgot password dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your account email and we’ll send a reset link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <label htmlFor="fp-email" className="text-[13px] font-medium">
              Email
            </label>
            <Input
              id="fp-email"
              type="email"
              placeholder="you@agency.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendReset}>
              <Mail aria-hidden="true" /> Send reset link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CenterCard>
  );
}

/* ------------------------------------------------------------------ */
/* Pending approval                                                    */
/* ------------------------------------------------------------------ */

export function PendingApproval() {
  return (
    <CenterCard>
      <Card className="shadow-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full bg-teal/15"
            aria-hidden="true"
          >
            <Hourglass className="h-6 w-6 text-teal-600" />
          </span>
          <CardTitle className="mt-4 text-xl">Approval pending</CardTitle>
          <CardDescription className="mt-2 max-w-xs">
            Your agency registration is being reviewed by the Baligo team. You’ll receive an email as
            soon as your account is approved — usually within one business day.
          </CardDescription>

          <dl className="mt-5 w-full rounded-lg bg-muted/60 px-4 py-3 text-left text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Agency</dt>
              <dd className="font-medium">Jelajah Wisata</dd>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">priya@jelajahwisata.id</dd>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant="warning">
                  <Check className="sr-only" /> Pending review
                </Badge>
              </dd>
            </div>
          </dl>

          <Button variant="ghost" className="mt-5" asChild>
            <a href="mailto:contracts@baligo.example?subject=Approval%20follow-up">
              <LifeBuoy aria-hidden="true" /> Contact support
            </a>
          </Button>
          <div className="mt-3">
            <BackToSignIn />
          </div>
        </CardContent>
      </Card>
    </CenterCard>
  );
}

/* ------------------------------------------------------------------ */
/* Deactivated                                                         */
/* ------------------------------------------------------------------ */

export function Deactivated() {
  return (
    <CenterCard>
      <Card className="shadow-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full bg-muted"
            aria-hidden="true"
          >
            <UserRoundX className="h-6 w-6 text-muted-foreground" />
          </span>
          <CardTitle className="mt-4 text-xl">Account deactivated</CardTitle>
          <CardDescription className="mt-2 max-w-xs">
            This agent account is currently deactivated. Your saved quotations are kept on file — the
            Baligo team can restore your access on request.
          </CardDescription>

          <Button variant="ghost" className="mt-5" asChild>
            <a
              href="mailto:contracts@baligo.example?subject=Account%20reactivation%20request"
              aria-label="Email Baligo support to reactivate your account"
            >
              <MailX aria-hidden="true" /> Contact support
            </a>
          </Button>
          <div className="mt-3">
            <BackToSignIn />
          </div>
        </CardContent>
      </Card>
    </CenterCard>
  );
}
