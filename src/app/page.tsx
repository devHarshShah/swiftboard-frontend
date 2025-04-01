import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Play,
  MessageSquare,
  ClipboardList,
  Trello,
  GitBranch,
  Star,
  Briefcase,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">
                S
              </span>
            </div>
            <span className="font-bold text-xl">SwiftBoard</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#benefits"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Benefits
            </Link>
            <Link
              href="#testimonials"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-md hover:bg-secondary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Manage Your Team <span className="text-primary">Effectively</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg">
              All-in-one employee management platform with kanban boards, task
              management, workflow automation, and team communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/auth/signup"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md text-center hover:bg-primary/90 transition-all"
              >
                Get started for free
              </Link>
              <Link
                href="#demo"
                className="px-6 py-3 border border-border rounded-md flex items-center justify-center gap-2 hover:bg-secondary transition-all"
              >
                <Play className="h-5 w-5" />
                Watch demo
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="w-full aspect-video bg-card rounded-lg shadow-xl overflow-hidden border border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
              <div className="p-4 flex flex-col h-full">
                <div className="h-6 flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="bg-background/50 rounded-md p-3">
                    <div className="h-3 w-1/2 bg-primary/30 rounded mb-2"></div>
                    <div className="h-full bg-accent/20 rounded flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/40"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-background/50 rounded-md p-3 h-1/2">
                      <div className="h-3 w-1/3 bg-chart-3/30 rounded mb-2"></div>
                      <div className="flex justify-between h-[80%] items-end">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="w-4 bg-chart-3/40 rounded-sm"
                            style={{ height: `${20 + Math.random() * 60}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-md p-3 h-1/2">
                      <div className="h-3 w-2/5 bg-chart-1/30 rounded mb-2"></div>
                      <div className="flex justify-between h-[80%] items-end">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-[20%] bg-chart-1/40 rounded-sm"
                            style={{ height: `${30 + Math.random() * 50}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 -z-10 w-full h-full rounded-lg bg-secondary/70"></div>
          </div>
        </div>
      </section>

      {/* Trusted by Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground mb-10">
            Trusted by innovative teams worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              "TechNova Inc",
              "Quantum Corp",
              "Atlas Enterprise",
              "Nexus Group",
              "Pinnacle Systems",
            ].map((company) => (
              <div
                key={company}
                className="text-muted-foreground/70 font-semibold text-lg"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Powerful Features, Simple Interface
          </h2>
          <p className="text-muted-foreground text-lg">
            SwiftBoard combines employee management with intuitive tools, making
            team coordination effortless and efficient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Kanban Boards",
              description:
                "Visualize your team's workflow with customizable kanban boards. Drag and drop tasks between stages to track progress.",
              icon: <Trello className="h-6 w-6" />,
            },
            {
              title: "Task Management",
              description:
                "Create, assign, and track tasks with deadlines, priorities, attachments, and detailed descriptions.",
              icon: <ClipboardList className="h-6 w-6" />,
            },
            {
              title: "Workflow Builder",
              description:
                "Design custom workflows with automated actions, approvals, and notifications to streamline processes.",
              icon: <GitBranch className="h-6 w-6" />,
            },
            {
              title: "Team Collaboration",
              description:
                "Collaborate with team members through comments, @mentions, shared files, and real-time updates.",
              icon: <Users className="h-6 w-6" />,
            },
            {
              title: "Team Chat",
              description:
                "Communicate efficiently with built-in chat channels, direct messages, and threaded conversations.",
              icon: <MessageSquare className="h-6 w-6" />,
            },
            {
              title: "Secure & Reliable",
              description:
                "Keep your team data secure with role-based permissions, activity logs, and end-to-end encryption.",
              icon: <Shield className="h-6 w-6" />,
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-lg border border-border hover:border-primary/40 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="benefits" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Everything Your Team Needs in One Place
            </h2>
            <p className="text-muted-foreground text-lg">
              Streamline your team management with our intuitive interface and
              powerful tools.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="w-full bg-card rounded-lg shadow-xl overflow-hidden border border-border p-4">
              <div className="grid grid-cols-12 gap-4 h-[500px]">
                <div className="col-span-3 bg-background/40 rounded-md p-3 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                    <div>
                      <div className="h-2.5 w-16 bg-foreground/30 rounded"></div>
                      <div className="h-2 w-12 bg-foreground/20 rounded mt-1"></div>
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-md flex items-center gap-2 ${i === 1 ? "bg-primary/10" : ""}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-sm ${i === 1 ? "bg-primary" : "bg-foreground/20"}`}
                        ></div>
                        <div className="h-2 w-full bg-foreground/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto p-2 rounded-md bg-primary/5 border border-primary/20 flex items-center justify-center">
                    <div className="h-2 w-20 bg-primary/30 rounded"></div>
                  </div>
                </div>

                <div className="col-span-9 grid grid-cols-2 grid-rows-2 gap-4">
                  <div className="bg-background/40 rounded-md overflow-hidden">
                    <div className="p-3 border-b border-border flex justify-between items-center">
                      <div className="h-2.5 w-24 bg-primary/30 rounded"></div>
                      <div className="h-4 w-4 rounded-full bg-foreground/10"></div>
                    </div>
                    <div className="p-4 h-[calc(100%-42px)] flex items-end">
                      <div className="w-full flex justify-between items-end h-full">
                        {[30, 60, 40, 80, 50, 70, 45].map((h, i) => (
                          <div
                            key={i}
                            className="w-[10%] bg-chart-1 rounded-sm"
                            style={{ height: `${h}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-background/40 rounded-md overflow-hidden">
                    <div className="p-3 border-b border-border flex justify-between items-center">
                      <div className="h-2.5 w-20 bg-chart-3/30 rounded"></div>
                      <div className="h-4 w-4 rounded-full bg-foreground/10"></div>
                    </div>
                    <div className="p-4 h-[calc(100%-42px)] flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-full border-8 border-chart-3/20"></div>
                        <div
                          className="absolute inset-0 rounded-full border-8 border-chart-3"
                          style={{
                            clipPath:
                              "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 50%)",
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold">65%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background/40 rounded-md overflow-hidden">
                    <div className="p-3 border-b border-border flex justify-between items-center">
                      <div className="h-2.5 w-28 bg-chart-5/30 rounded"></div>
                      <div className="h-4 w-4 rounded-full bg-foreground/10"></div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        {[
                          "Project A",
                          "Project B",
                          "Project C",
                          "Project D",
                        ].map((product, i) => {
                          const percent = [70, 45, 85, 30][i];
                          return (
                            <div key={product} className="flex items-center">
                              <div className="w-16 text-xs">{product}</div>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden mx-2">
                                <div
                                  className={`h-full rounded-full bg-chart-${i + 1}`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <div className="w-8 text-xs text-right">
                                {percent}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-background/40 rounded-md overflow-hidden">
                    <div className="p-3 border-b border-border flex justify-between items-center">
                      <div className="h-2.5 w-24 bg-chart-4/30 rounded"></div>
                      <div className="h-4 w-4 rounded-full bg-foreground/10"></div>
                    </div>
                    <div className="p-4 h-[calc(100%-42px)]">
                      <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col gap-2">
                          <div className="bg-background/60 rounded p-2 flex-1 flex items-center justify-center">
                            <div className="text-2xl font-bold">24</div>
                          </div>
                          <div className="bg-background/60 rounded p-2 flex-1 flex items-center justify-center">
                            <div className="text-2xl font-bold">76%</div>
                          </div>
                        </div>
                        <div className="bg-background/60 rounded p-2 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-chart-4/20 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-chart-4/40 flex items-center justify-center">
                              <span className="text-sm">$2.4k</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied teams who have transformed their
            workflow with SwiftBoard.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote:
                "SwiftBoard has revolutionized how we manage our team. Task assignments and tracking have never been so easy.",
              author: "Jessica Thompson",
              role: "HR Director, TechNova Inc",
              avatar: "JT",
            },
            {
              quote:
                "The kanban boards and workflow automation have reduced our project delivery time by 40%. Our team loves it!",
              author: "Mark Williams",
              role: "Project Manager, Quantum Corp",
              avatar: "MW",
            },
            {
              quote:
                "Team communication has improved dramatically since we started using SwiftBoard's chat and collaboration features.",
              author: "Sophia Garcia",
              role: "Team Lead, Atlas Enterprise",
              avatar: "SG",
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-lg border border-border"
            >
              <div className="mb-4 text-primary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="inline h-4 w-4 mr-1" />
                ))}
              </div>
              <p className="text-foreground mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose the plan that works for your team. All plans include a
              14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$9",
                description: "Perfect for small teams and startups",
                features: [
                  "Up to 10 team members",
                  "Basic kanban boards",
                  "Task management",
                  "Team chat",
                  "Email support",
                ],
                cta: "Start free trial",
                popular: false,
              },
              {
                name: "Pro",
                price: "$29",
                description: "Ideal for growing teams and departments",
                features: [
                  "Up to 50 team members",
                  "Advanced kanban features",
                  "Workflow automation",
                  "Time tracking",
                  "Team collaboration tools",
                  "Priority email & chat support",
                ],
                cta: "Start free trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large organizations with specific needs",
                features: [
                  "Unlimited team members",
                  "Advanced security controls",
                  "Custom workflows",
                  "API access",
                  "Custom integrations",
                  "Dedicated account manager",
                ],
                cta: "Contact sales",
                popular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-card rounded-xl border ${plan.popular ? "border-primary scale-105 shadow-lg" : "border-border"} overflow-hidden flex flex-col`}
              >
                {plan.popular && (
                  <div className="bg-primary py-1 text-center text-primary-foreground text-sm">
                    Most Popular
                  </div>
                )}
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link
                    href="/auth/signup"
                    className={`w-full py-2 px-4 rounded-md text-center block transition-colors ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-primary/10 border border-primary/20 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to transform how your team works?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of teams that use SwiftBoard to streamline their
            workflow and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
            >
              Get started for free
            </Link>
            <Link
              href="#demo"
              className="px-6 py-3 bg-card border border-border rounded-md hover:bg-secondary transition-colors inline-flex items-center justify-center gap-2"
            >
              Schedule a demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                <span className="font-bold text-lg">SwiftBoard</span>
              </div>
              <p className="text-muted-foreground mb-4">
                All-in-one employee management platform for modern teams.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Briefcase className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Users className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Changelog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tutorials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} SwiftBoard. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
