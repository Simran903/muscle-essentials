"use client"

import { SectionHeading } from "@/app/components/Common/SectionHeading"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion"

const faqs = [
  {
    id: "authentic",
    question: "How do I know your supplements are authentic?",
    answer:
      "We source directly from authorized distributors and brands. Every product ships with verifiable batch information where the manufacturer provides it, and we never mix grey-market inventory with our catalog.",
  },
  {
    id: "shipping",
    question: "How long does delivery take?",
    answer:
      "Most metro orders are dispatched within 1–2 business days. Transit time depends on your pin code and courier partner; you will receive tracking details as soon as your order ships.",
  },
  {
    id: "returns",
    question: "What is your return policy?",
    answer:
      "Unopened products in original packaging may be eligible for return or exchange within the window stated at checkout. Opened consumables are generally not returnable except where required by law or for verified quality issues.",
  },
  {
    id: "stacking",
    question: "Can I combine protein, creatine, and a pre-workout?",
    answer:
      "Many people stack these categories, but timing, caffeine tolerance, and your health profile matter. If you are new to supplements or have medical conditions, check the label directions and speak with a qualified professional before combining products.",
  },
  {
    id: "storage",
    question: "How should I store powders and capsules?",
    answer:
      "Keep containers sealed, away from direct heat and moisture, and out of reach of children. Avoid transferring product into non-food containers unless the label says it is safe to do so.",
  },
] as const

export const FAQSection = () => {
  return (
    <section id="faq" className="mx-auto w-full max-w-360 px-5 sm:px-8">
      <SectionHeading
        title="Questions & answers"
        description="Straight answers about shopping, delivery, and using supplements responsibly."
      />
      <div className="mt-6 px-1 py-2 sm:px-2 sm:py-3">
        <Accordion type="single" collapsible className="w-full px-2 sm:px-3">
          {faqs.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-base font-medium text-foreground sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </AccordionContent> 
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
