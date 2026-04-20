import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { SiSubstack } from "react-icons/si";

export default function Footer() {
  return (
    <section className="w-full flex flex-col justify-between px-6 py-10 bg-background border-t border-border">
      <div className="flex flex-col md:flex-row items-center justify-around mb-16 border-b border-border pb-10">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="font-bold text-2xl text-foreground">Glint</h1>
          <p className="text-muted-foreground text-sm font-medium">
            An analyst who knows your book
          </p>
          <h1 className="font-bold mt-10 text-base text-foreground">Contact</h1>
          <p className="text-sm font-medium mb-8 text-muted-foreground">
            echoStacks.dev@gmail.com
          </p>
          <div className="flex items-center gap-x-6 text-muted-foreground">
            <Link
              href="https://www.instagram.com/nb.codes/"
              className="hover:text-primary transition-colors"
            >
              <FaInstagram size={18} />
            </Link>

            <Link
              href="https://github.com/nbcodes99"
              className="hover:text-primary transition-colors"
            >
              <FaGithub size={18} />
            </Link>

            <Link
              href="https://nbcodes.substack.com/"
              className="hover:text-primary transition-colors"
            >
              <SiSubstack size={18} />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-x-14 mt-20 md:mt-0">
          <div className="flex flex-col items-start">
            <h1 className="font-bold text-xl mb-3 text-foreground">
              Help & Info
            </h1>
            <span className="flex flex-col gap-y-2">
              <Link
                href="/features"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/signup"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/signin"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-evenly items-center">
        <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
          © {new Date().getFullYear()}{" "}
          <span className="text-primary font-semibold">Glint</span>. All rights
          reserved.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-4 mt-6 md:mt-0">
          <a
            href="/privacy"
            className="underline cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="underline cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/cookies"
            className="underline cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cookies
          </a>
        </div>
      </div>
    </section>
  );
}
