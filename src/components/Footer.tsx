import { BookOpen, Heart, Mail, Shield, Users } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-secondary" />
              <div className="flex flex-col">
                <h3 className="font-fredoka font-bold text-lg">Kid Inside</h3>
                <p className="text-sm text-background/70 -mt-1">The Story</p>
              </div>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              Transforming learning into magical adventures where every child becomes the hero of their own educational story.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-fredoka font-semibold text-lg mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#" className="hover:text-secondary transition-smooth">Cartoon Avatars</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Story Library</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Audio Narration</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Progress Tracking</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Bilingual Support</a></li>
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="font-fredoka font-semibold text-lg mb-4">Subjects</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#" className="hover:text-secondary transition-smooth">History Adventures</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Science Quests</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Math Journeys</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Geography Exploration</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">STEM Stories</a></li>
            </ul>
          </div>

          {/* Support & Safety */}
          <div>
            <h4 className="font-fredoka font-semibold text-lg mb-4">Support & Safety</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#" className="hover:text-secondary transition-smooth flex items-center space-x-2">
                <Shield className="h-3 w-3" />
                <span>Privacy Policy</span>
              </a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth flex items-center space-x-2">
                <Users className="h-3 w-3" />
                <span>COPPA Compliance</span>
              </a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>Contact Support</span>
              </a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Help Center</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-background/60">
            © 2024 Kid Inside The Story. Made with <Heart className="h-4 w-4 text-red-400 inline mx-1" /> for curious young minds.
          </p>
          <div className="flex space-x-6 text-sm text-background/80">
            <span>🌟 Educational Standards Aligned</span>
            <span>🔒 Privacy Protected</span>
            <span>🌍 Available in EN/ES</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;