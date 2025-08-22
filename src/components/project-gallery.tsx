"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Heart, 
  Eye, 
  Calendar,
  MapPin,
  Users,
  Star
} from "lucide-react"

const ProjectGallery = () => {
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Projects" },
    { id: "weddings", name: "Luxury Weddings" },
    { id: "corporate", name: "Corporate Events" },
    { id: "milestones", name: "Milestone Celebrations" },
    { id: "tents", name: "Tent Installations" }
  ]

  const projects = [
    {
      id: 1,
      title: "Elegant Garden Wedding",
      category: "weddings",
      location: "Greenwich, CT",
      guests: 180,
      date: "September 2024",
      description: "Romantic outdoor ceremony with luxury tenting and crystal chandeliers",
      image: "wedding-garden",
      likes: 124,
      views: 1850,
      featured: true
    },
    {
      id: 2,
      title: "Corporate Gala Dinner",
      category: "corporate", 
      location: "Stamford, CT",
      guests: 250,
      date: "August 2024",
      description: "Sophisticated corporate event with premium furniture and lighting",
      image: "corporate-gala",
      likes: 89,
      views: 1240,
      featured: false
    },
    {
      id: 3,
      title: "50th Anniversary Celebration",
      category: "milestones",
      location: "Westport, CT",
      guests: 120,
      date: "July 2024", 
      description: "Golden anniversary party with elegant gold accents and luxury seating",
      image: "anniversary-gold",
      likes: 156,
      views: 2100,
      featured: true
    },
    {
      id: 4,
      title: "Waterfront Tent Wedding",
      category: "tents",
      location: "Mystic, CT",
      guests: 200,
      date: "June 2024",
      description: "Stunning waterfront ceremony with luxury tenting and panoramic views",
      image: "tent-waterfront",
      likes: 198,
      views: 2850,
      featured: true
    },
    {
      id: 5,
      title: "Product Launch Event",
      category: "corporate",
      location: "New Haven, CT", 
      guests: 300,
      date: "May 2024",
      description: "Modern tech company launch with sleek furniture and ambient lighting",
      image: "tech-launch",
      likes: 76,
      views: 980,
      featured: false
    },
    {
      id: 6,
      title: "Sweet 16 Birthday Party",
      category: "milestones",
      location: "Fairfield, CT",
      guests: 85,
      date: "April 2024",
      description: "Glamorous sweet sixteen with pink and gold theme decorations",
      image: "sweet-sixteen",
      likes: 142,
      views: 1650,
      featured: false
    }
  ]

  const filteredProjects = activeCategory === "all" 
    ? projects 
    : projects.filter(project => project.category === activeCategory)

  const featuredProjects = projects.filter(project => project.featured)

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gold-50">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Recent Projects
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Make It Beautiful With{" "}
              <span className="bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                Prime Lux Events
              </span>
            </h2>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Recent Project Gallery
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover how we transform ordinary spaces into extraordinary celebrations. 
              Each event tells a unique story of elegance, luxury, and unforgettable memories.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "gold" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="px-6 py-2"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Featured Projects - Large Display */}
          {activeCategory === "all" && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Featured Celebrations
              </h3>
              <div className="grid lg:grid-cols-3 gap-8">
                {featuredProjects.map((project) => (
                  <Card key={project.id} variant="glass" hover className="overflow-hidden group">
                    {/* Project Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gold-200 via-gold-100 to-white relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-700">
                          <div className="w-20 h-20 bg-gold-200 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                            <Star className="w-10 h-10 text-gold-700" />
                          </div>
                          <p className="text-sm font-medium">{project.title}</p>
                        </div>
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <p className="text-sm mb-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                <span>{project.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{project.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                        {project.featured && (
                          <div className="bg-gold-100 text-gold-800 text-xs px-2 py-1 rounded-full">
                            Featured
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{project.guests} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{project.date}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                        {project.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredProjects.slice(0, 6).map((project) => (
              <Card key={project.id} variant="glass" hover className="overflow-hidden group">
                {/* Project Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gold-100 to-white relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
                        <span className="text-2xl">📸</span>
                      </div>
                      <p className="text-xs">{project.title}</p>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full">
                      {categories.find(cat => cat.id === project.category)?.name}
                    </div>
                  </div>

                  {/* Stats Overlay */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{project.likes}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>{project.location}</span>
                    <span>{project.guests} guests</span>
                  </div>
                  <p className="text-gray-600 text-sm">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center">
            <Button variant="gold" size="lg" className="group">
              View Our Full Gallery
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "500+", label: "Events Completed" },
              { number: "50K+", label: "Happy Guests" },
              { number: "15+", label: "Years Experience" },
              { number: "5", label: "States Served" }
            ].map((stat, index) => (
              <Card key={index} variant="glass" className="p-6 text-center">
                <div className="text-3xl font-bold text-gold-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectGallery