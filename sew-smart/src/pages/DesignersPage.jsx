import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const designers = [
  {
    id: 1,
    name: "Emily Chen",
    avatar:
      "https://sinsi.princeton.edu/sites/g/files/toruqf6756/files/styles/3x2_750w_500h/public/people/chen_emily_edit.jpg?h=bdaa9715&itok=4gTKYh4R",
    bio: "Contemporary fashion designer specializing in sustainable urban wear",
    location: "New York, USA",
    specialties: ["Sustainable Fashion", "Urban Wear", "Minimalist Design"],
    designs: [
      {
        id: 101,
        title: "Eco-friendly Summer Dress",
        image:
          "https://images.squarespace-cdn.com/content/v1/58163c29197aea6c5f166b6f/1618927574771-KZ7O5FKM1JF5GD5ESMHR/Sustainable+flowery+dress+from+Christy+Dawn",
        price: 299.99,
        description: "Made from 100% recycled materials, perfect for summer",
        category: "Dresses",
        inStock: true,
      },
      {
        id: 102,
        title: "Urban Denim Jacket",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_QQPib22POd2QeTXTja41lWS3kUDkY5-Zqg&s",
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
    avatar:
      "https://cdn.prod.website-files.com/5fffd207e6428d73e4dff838/6191ee509c72cf538d482437_Marcus-Wong-profile.gif",
    bio: "Avant-garde designer merging traditional techniques with modern technology",
    location: "London, UK",
    specialties: ["Avant-garde", "Digital Fashion", "Couture"],
    designs: [
      {
        id: 201,
        title: "Digital Print Blazer",
        image:
          "https://i5.walmartimages.com/seo/XASZHN-Summer-Blazer-Men-s-Independence-Day-Digital-Print-Casual-Personality-Vintage-Long-Sleeved-Suit-Jacket-White-M_dc390d4e-c2fa-4fd2-ad06-5738ca0c6b4b.fe99b46244d37061d7e2bc32db923a8b.jpeg",
        price: 399.99,
        description: "AI-generated patterns on sustainable fabric",
        category: "Blazers",
        inStock: true,
      },
      {
        id: 202,
        title: "Smart Fabric Dress",
        image:
          "https://images.stockcake.com/public/d/4/f/d4f484dd-e8bb-46a3-81c4-76a527474711_medium/luminous-fashion-future-stockcake.jpg",
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
    avatar: "https://assets.workingnotworking.com/hhituxkhqytaxrdcx81j3qhvq23e",
    bio: "Bringing Latin American influences to contemporary fashion",
    location: "Miami, USA",
    specialties: ["Cultural Fusion", "Resort Wear", "Accessories"],
    designs: [
      {
        id: 301,
        title: "Tropical Print Jumpsuit",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGlkjd-wMsACOUXjowQM6ynIf7yr_tD56dmA&s",
        price: 249.99,
        description: "Vibrant prints inspired by tropical flora",
        category: "Jumpsuits",
        inStock: true,
      },
      {
        id: 302,
        title: "Handwoven Beach Bag",
        image:
          "https://www.mayamamweavers.com/cdn/shop/products/optimized-DSC_0265-Carousel-Beach-Tote_97e121ff-5372-4e56-8644-77281ef768a4_1024x1024.jpg?v=1530799925",
        price: 159.99,
        description: "Traditional weaving techniques meet modern design",
        category: "Accessories",
        inStock: true,
      },
    ],
  },
  {
    id: 4,
    name: "Aria Giovani",
    avatar:
      "https://vz.cnwimg.com/thumb-900x/wp-content/uploads/2019/10/Aria-Giovanni.jpg",
    bio: "Italian haute couture expert blending classic and futuristic designs",
    location: "Milan, Italy",
    specialties: ["Haute Couture", "Sculptural Design", "Luxury Materials"],
    designs: [
      {
        id: 401,
        title: "Velvet Corset Gown",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp8E-8Hv3hpr-GZLfjAiJAuPgNkzt1OzfDGQ&s",
        price: 799.99,
        description: "A luxurious gown with intricate velvet detailing.",
        category: "Evening Wear",
        inStock: true,
      },
      {
        id: 402,
        title: "Silk Blouse",
        image:
          "https://ca.slipintosoft.com/cdn/shop/files/short-sleeves-womens-silk-blouse-v-neck-ladies-silk-tops-944789.jpg?v=1724314281",
        price: 349.99,
        description: "Elegant silk blouse perfect for formal occasions.",
        category: "Tops",
        inStock: false,
      },
    ],
  },
  {
    id: 5,
    name: "Lila Patel",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz9KWttc504ICKvw7oyVmGg5tkYgVM1ItDuQ&s",
    bio: "Reviving traditional Indian handlooms for global fashion.",
    location: "Mumbai, India",
    specialties: ["Handlooms", "Cultural Fashion", "Ethical Production"],
    designs: [
      {
        id: 501,
        title: "Banarasi Sari",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5WvlakturQuJYYEMGHVq9Kladv5oQp2jF8A&s",
        price: 499.99,
        description: "Handwoven silk sari with golden zari work.",
        category: "Traditional Wear",
        inStock: true,
      },
      {
        id: 502,
        title: "Block Print Kurta",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOt-zmNM0traIbHk_LdJMeBL5uabIEc_MJPA&s",
        price: 199.99,
        description: "Block-printed kurta with intricate detailing.",
        category: "Casual Wear",
        inStock: true,
      },
    ],
  },
  {
    id: 6,
    name: "Carlos Mendez",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR5bgU_8KetiC5L35olMlLp52YIBGUw3Pxag&s",
    bio: "Designer known for bold and colorful Latin-inspired prints.",
    location: "Mexico City, Mexico",
    specialties: ["Prints", "Latin American Styles", "Resort Wear"],
    designs: [
      {
        id: 601,
        title: "Aztec Print Dress",
        image:
          "https://i.etsystatic.com/15265651/r/il/857b1b/3149013698/il_fullxfull.3149013698_p2rv.jpg",
        price: 299.99,
        description: "Bright Aztec-inspired prints on a flowing dress.",
        category: "Dresses",
        inStock: false,
      },
      {
        id: 602,
        title: "Canvas Tote",
        image:
          "https://cozyearth.com/cdn/shop/files/3_Cedar_Waxedcanvasbag.jpg?v=1726859679&width=1024",
        price: 79.99,
        description: "Durable and stylish tote bag with hand-painted prints.",
        category: "Accessories",
        inStock: true,
      },
    ],
  },
  {
    id: 7,
    name: "Kai Takashi",
    avatar: "https://kaitakahashi.com/assets/kai-avatar-full.png",
    bio: "Blending traditional Japanese aesthetics with modern urban fashion.",
    location: "Tokyo, Japan",
    specialties: ["Kimono-Inspired", "Minimalist Urban", "Eco-friendly"],
    designs: [
      {
        id: 701,
        title: "Kimono Wrap Dress",
        image:
          "https://kalitrends.com/cdn/shop/products/LSKIMONOSLEEVEMAXI_800x.jpg?v=1637735770",
        price: 449.99,
        description: "Contemporary wrap dress inspired by traditional kimonos.",
        category: "Dresses",
        inStock: true,
      },
      {
        id: 702,
        title: "Origami Skirt",
        image:
          "https://no6store.com/cdn/shop/files/epinglerOrigamiSkirtinBlack_01_557x835_crop_center.jpg?v=1726783912",
        price: 349.99,
        description: "Skirt with folds inspired by Japanese origami.",
        category: "Bottoms",
        inStock: false,
      },
    ],
  },
];

const DesignersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredDesigners = designers.filter(
    (designer) =>
      designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      designer.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Featured Designers
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover unique pieces from our curated selection of innovative
          designers from around the world.
        </p>
      </header>

      <div className="max-w-xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search designers by name or specialty..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDesigners.length > 0 ? (
          filteredDesigners.map((designer) => (
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
                  </div>
                </div>
                <p className="mt-4 text-gray-600 text-sm">{designer.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {designer.specialties.map((specialty, index) => (
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
                    {designer.designs.slice(0, 2).map((design) => (
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
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No designers found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DesignersPage;
