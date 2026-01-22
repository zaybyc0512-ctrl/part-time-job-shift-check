import React, { useState } from 'react';
import { X } from 'lucide-react';

const Footer = () => {
    const [activeModal, setActiveModal] = useState(null); // 'privacy', 'contact', or null

    const openPrivacy = () => setActiveModal('privacy');
    const openContact = () => setActiveModal('contact');
    const close = () => setActiveModal(null);

    return (
        <footer className="mt-12 py-8 bg-gray-100 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex flex-col gap-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    © 2026 Shift Check Tool. All rights reserved.
                </p>
                <div className="flex justify-center gap-6 text-xs text-gray-600 dark:text-gray-300">
                    <button onClick={openPrivacy} className="hover:underline hover:text-primary">
                        プライバシーポリシー
                    </button>
                    <button onClick={openContact} className="hover:underline hover:text-primary">
                        運営者情報・お問い合わせ
                    </button>
                </div>
            </div>

            {/* モーダル (共通レイアウト) */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={close}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 shadow-xl relative max-h-[80vh] overflow-y-auto text-left" onClick={e => e.stopPropagation()}>
                        <button onClick={close} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        {/* プライバシーポリシー内容 */}
                        {activeModal === 'privacy' && (
                            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-2">プライバシーポリシー</h3>
                                <section>
                                    <h4 className="font-bold mb-1">1. 情報の取得について</h4>
                                    <p>当ツールは、ユーザーが入力したデータ（シフト情報、時給設定など）を、ユーザーの端末内（ブラウザのLocalStorage）にのみ保存します。サーバーへの送信・保存は一切行いません。</p>
                                </section>
                                <section>
                                    <h4 className="font-bold mb-1">2. Cookieと広告配信について</h4>
                                    <p>当サイトでは、第三者配信の広告サービス（Google AdSense等）を利用する予定です。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。</p>
                                </section>
                                <section>
                                    <h4 className="font-bold mb-1">3. 免責事項</h4>
                                    <p>当ツールの計算結果はあくまで目安です。正確な税額や控除額を保証するものではありません。最終的な税務判断は、税務署や専門家にご確認ください。</p>
                                </section>
                            </div>
                        )}

                        {/* お問い合わせ内容 */}
                        {activeModal === 'contact' && (
                            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-2">運営者情報・お問い合わせ</h3>
                                <p>
                                    当ツールをご利用いただきありがとうございます。<br />
                                    不具合の報告や機能のご要望は、以下の連絡先、またはGitHubリポジトリのIssueまでお願いいたします。
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <p className="font-bold">管理者: Shift Tool Admin</p>
                                    {/* 必要に応じてGoogleフォームのURLなどに差し替え可能 */}
                                    <div className="mt-2">
                                        <a href="https://x.com/Xv2UFh3LZzGJAqH" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold">
                                            公式X (旧Twitter) へ連絡する (@Xv2UFh3LZzGJAqH)
                                        </a>
                                        <p className="text-xs text-gray-500 mt-1">DMまたはリプライでお気軽にご連絡ください。</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
