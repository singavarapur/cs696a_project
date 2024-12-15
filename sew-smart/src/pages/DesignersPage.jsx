import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline";

// Mock data moved into component to ensure it's available
const designers = [
  {
    id: 1,
    name: "Emily Chen",
    avatar: "/api/placeholder/128/128",
    bio: "Contemporary fashion designer specializing in sustainable urban wear",
    location: "New York, USA",
    specialties: ["Sustainable Fashion", "Urban Wear", "Minimalist Design"],
    followers: 12500,
    designs: [
      {
        id: 101,
        title: "Eco-friendly Summer Dress",
        image: "/api/placeholder/400/500",
        price: 299.99,
        description: "Made from 100% recycled materials, perfect for summer",
        category: "Dresses",
        inStock: true,
      },
      {
        id: 102,
        title: "Urban Denim Jacket",
        image: "/api/placeholder/400/500",
        price: 199.99,
        description: "Sustainable denim with modern urban aesthetics",
        category: "Outerwear",
        inStock: true,
      },
    ],
  },
  {
    id: 2,
    name: "Marcus Wong",
    avatar: "/api/placeholder/128/128",
    bio: "Avant-garde designer merging traditional techniques with modern technology",
    location: "London, UK",
    specialties: ["Avant-garde", "Digital Fashion", "Couture"],
    followers: 18900,
    designs: [
      {
        id: 201,
        title: "Digital Print Blazer",
        image: "/api/placeholder/400/500",
        price: 399.99,
        description: "AI-generated patterns on sustainable fabric",
        category: "Blazers",
        inStock: true,
      },
      {
        id: 202,
        title: "Smart Fabric Dress",
        image: "/api/placeholder/400/500",
        price: 599.99,
        description: "Temperature-responsive fabric with classic silhouette",
        category: "Dresses",
        inStock: false,
      },
    ],
  },
  {
    id: 3,
    name: "Sofia Rodriguez",
    avatar: "/api/placeholder/128/128",
    bio: "Bringing Latin American influences to contemporary fashion",
    location: "Miami, USA",
    specialties: ["Cultural Fusion", "Resort Wear", "Accessories"],
    followers: 15700,
    designs: [
      {
        id: 301,
        title: "Tropical Print Jumpsuit",
        image: "/api/placeholder/400/500",
        price: 249.99,
        description: "Vibrant prints inspired by tropical flora",
        category: "Jumpsuits",
        inStock: true,
      },
      {
        id: 302,
        title: "Handwoven Beach Bag",
        image: "/api/placeholder/400/500",
        price: 159.99,
        description: "Traditional weaving techniques meet modern design",
        category: "Accessories",
        inStock: true,
      },
    ],
  },
];

const DesignersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDesigners = designers.filter(
    (designer) =>
      designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      designer.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Featured Designers
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover unique pieces from our curated selection of innovative
          designers from around the world.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search designers by name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Designers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDesigners.map((designer) => (
          <Link
            key={designer.id}
            to={`/designers/${designer.id}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {designer.name}
                  </h2>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {designer.location}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {designer.followers?.toLocaleString() || "0"} followers
                  </div>
                </div>
              </div>

              <p className="mt-4 text-gray-600 text-sm">{designer.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {designer.specialties?.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-sm text-gray-500">Featured designs:</div>
                <div className="mt-2 flex space-x-4">
                  {designer.designs?.slice(0, 2).map((design) => (
                    <img
                      key={design.id}
                      src={design.image}
                      alt={design.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredDesigners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No designers found</p>
        </div>
      )}
    </div>
  );
};

export default DesignersPage;
