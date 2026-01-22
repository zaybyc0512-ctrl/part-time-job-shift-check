import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-12 py-8 bg-slate-100 dark:bg-slate-800 text-center border-t border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex flex-col gap-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    © 2026 Fuyo Shift Check
                </p>
                <div className="flex justify-center gap-6 text-xs text-gray-600 dark:text-gray-400">
                    <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-500 transition-colors">
                        プライバシーポリシー
                    </a>
                    <a href="https://x.com/Xv2UFh3LZzGJAqH" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-500 transition-colors">
                        お問い合わせ
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
