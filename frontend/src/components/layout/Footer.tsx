import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark py-8 transition-colors duration-200">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-8 text-center md:flex md:items-center md:justify-between">
        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark">
          &copy; {new Date().getFullYear()} SQLGenius AI. All rights reserved.
        </p>
        <div className="mt-4 flex justify-center space-x-6 md:mt-0">
          <a
            href="#"
            className="text-sm text-text-secondaryLight dark:text-text-secondaryDark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-text-secondaryLight dark:text-text-secondaryDark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-text-secondaryLight dark:text-text-secondaryDark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
