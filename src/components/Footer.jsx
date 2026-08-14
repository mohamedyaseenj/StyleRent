import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold font-heading mb-4">StyleRent</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Premium clothing rental platform. Rent designer outfits for any occasion without the full price tag.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-gold transition-colors"><FiFacebook className="text-xl" /></a>
              <a href="#" className="text-gray-300 hover:text-gold transition-colors"><FiTwitter className="text-xl" /></a>
              <a href="#" className="text-gray-300 hover:text-gold transition-colors"><FiInstagram className="text-xl" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/catalog" className="text-gray-300 hover:text-gold transition-colors">Browse Catalog</Link></li>
              <li><Link to="/catalog?category=Evening+Gowns" className="text-gray-300 hover:text-gold transition-colors">Evening Wear</Link></li>
              <li><Link to="/catalog?category=Party+Dresses" className="text-gray-300 hover:text-gold transition-colors">Party Dresses</Link></li>
              <li><Link to="/catalog?category=Formal+Suits" className="text-gray-300 hover:text-gold transition-colors">Formal Suits</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-300">
                <FiMail className="text-gold" /> support@stylerent.com
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <FiPhone className="text-gold" /> +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <FiMapPin className="text-gold" /> 123 Fashion Ave, NY 10001
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 StyleRent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
