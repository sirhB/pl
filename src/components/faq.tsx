"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MessageCircle, Phone } from "lucide-react"

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "What type of luxury seating works best for my event style?",
      answer: "Our luxury seating collection includes elegant Chiavari chairs, plush lounge furniture, and sophisticated dining chairs. For formal events like weddings, we recommend our gold or silver Chiavari chairs. For cocktail receptions, our luxury lounge furniture creates intimate conversation areas. Corporate events benefit from our sleek modern seating options. Our event specialists will help you choose the perfect seating based on your event style, guest count, and venue."
    },
    {
      question: "How do I choose between premium table options for my celebration?",
      answer: "We offer round tables (60\" for 8 guests, 72\" for 10 guests), rectangular farm tables, cocktail tables, and specialty shapes. Round tables encourage conversation and work well for dinner parties and weddings. Farm tables create a rustic-elegant feel perfect for intimate gatherings. Cocktail tables are ideal for networking events and receptions. Our team considers your guest count, venue layout, and event flow to recommend the optimal table configuration."
    },
    {
      question: "I'm planning an event for 150+ guests - what do you recommend?",
      answer: "For large events, we recommend a combination approach: round tables for dining (accommodating 8-10 guests each), cocktail tables for mingling areas, and lounge furniture for relaxation zones. You'll need approximately 15-20 round tables for 150 guests. We also suggest our premium lighting packages to create ambiance, dance floor rentals, and upgraded linens. Our event specialists will create a detailed floor plan and recommend package deals for cost savings."
    },
    {
      question: "Do you offer package deals combining venue and rentals?",
      answer: "Yes! Our Prime Lux Event Hall packages are extremely popular. We offer several tiers: Essential Package (venue + basic tables/chairs), Premium Package (adds linens, lighting, and decor), and Luxury Package (full-service with premium furniture, lighting design, and setup). Venue + rental packages save 15-25% compared to booking separately. Package pricing varies by guest count, event type, and season."
    },
    {
      question: "What's included in your delivery and setup service?",
      answer: "Our full-service delivery includes transportation from our Shelton, CT warehouse, professional setup according to your event layout, and complete breakdown after your event. Setup includes table arrangement, chair placement, linen installation, and basic decor positioning. We arrive 2-4 hours before your event start time. Delivery pricing is calculated based on distance from Shelton, number of stairs, and same-day pickup options."
    },
    {
      question: "How far in advance should I book for peak season events?",
      answer: "For peak season (May-October) and popular dates (Saturdays, holidays), we recommend booking 3-6 months in advance. Popular items like premium tents, luxury lounge furniture, and our Event Hall book earliest. For off-peak dates (November-April, weekdays), 4-8 weeks advance booking is typically sufficient. We maintain a waitlist for high-demand items and dates. Holiday parties and corporate events should be booked by early fall."
    },
    {
      question: "When do I pay, and what payment methods are available?",
      answer: "We require a 50% deposit to secure your booking, with the balance due 7 days before your event. For venue bookings, we require a $500 security deposit (refundable). We accept credit cards, bank transfers, and business checks. Payment plans are available for orders over $5,000. Final headcount and any additions can be confirmed up to 72 hours before your event."
    },
    {
      question: "Do I need to put down a deposit for luxury furniture rental?",
      answer: "Yes, we require a 50% deposit for all rental orders to secure your items and date. This deposit is applied to your final balance. For high-value items (over $10,000), we may require additional security deposit. Deposits are non-refundable within 14 days of your event date, but can be transferred to a future booking with 30+ days notice. We provide detailed rental agreements outlining all terms and conditions."
    },
    {
      question: "When do I get my deposit back?",
      answer: "Security deposits are returned within 7-10 business days after your event, provided all items are returned in good condition. We inspect all returned items for damage beyond normal wear. Any cleaning fees or damage charges are deducted from the security deposit. We provide an itemized statement with your deposit return. Venue security deposits follow the same timeline after our final venue inspection."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gold-50 to-slate-50">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get answers to common questions about our luxury rental services, 
              venue bookings, and event planning process.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4 mb-12">
            {faqs.map((faq, index) => (
              <Card key={index} variant="glass" className="overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/10 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="text-gold-600 flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <Card variant="gold" className="p-8">
              <div className="max-w-md mx-auto">
                <MessageCircle className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Still Have Questions?
                </h3>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Our event specialists are here to help you plan the perfect celebration. 
                  Get personalized answers and expert recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="secondary" className="flex-1 bg-white text-gold-600 hover:bg-gray-100">
                    <Phone className="w-4 h-4 mr-2" />
                    Call (203) 555-0123
                  </Button>
                  <Button variant="outline" className="flex-1 border-white text-white hover:bg-white/20">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card variant="glass" className="p-6 text-center hover:bg-white/20 transition-colors duration-200">
              <div className="text-gold-600 mb-3">
                <MessageCircle className="w-8 h-8 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Event Planning Guide</h4>
              <p className="text-gray-600 text-sm">Download our comprehensive planning checklist</p>
            </Card>
            
            <Card variant="glass" className="p-6 text-center hover:bg-white/20 transition-colors duration-200">
              <div className="text-gold-600 mb-3">
                <Phone className="w-8 h-8 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pricing Calculator</h4>
              <p className="text-gray-600 text-sm">Get instant estimates for your event needs</p>
            </Card>
            
            <Card variant="glass" className="p-6 text-center hover:bg-white/20 transition-colors duration-200">
              <div className="text-gold-600 mb-3">
                <MessageCircle className="w-8 h-8 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Schedule Consultation</h4>
              <p className="text-gray-600 text-sm">Book a free planning session with our experts</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ