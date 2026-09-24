const steps = [
  {
    title: "Enter your email",
    text: "For your first protected document, enter your business email address.",
  },
  {
    title: "Confirm the link",
    text: "You'll receive an email with a confirmation link. One click is all it takes.",
  },
  {
    title: "Download",
    text: "After that, all protected documents on this page are available to you.",
  },
];

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how"
      className="mt-8 grid grid-cols-1 gap-10 border-t border-line pt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[30px]"
    >
      <h2 id="how" className="m-0 text-[32px] leading-[1.31] font-extralight">
        How unlocking works
      </h2>
      {steps.map((step, i) => (
        <div key={step.title} className="flex flex-col gap-3">
          <div className="text-[80px] leading-[0.8] font-light text-sky">
            {String(i + 1).padStart(2, "0")}
          </div>
          <h3 className="m-0 text-xl font-medium">{step.title}</h3>
          <p className="m-0 text-[15px] leading-relaxed text-body">{step.text}</p>
        </div>
      ))}
    </section>
  );
}
