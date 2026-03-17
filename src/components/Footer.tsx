const Footer = () => {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-warm flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-xs">S</span>
          </div>
          <span className="font-display font-semibold text-foreground">SkillSwap</span>
        </div>
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} SkillSwap. Learn together, grow together.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy</a>
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms</a>
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
