import React from 'react';

const GuideSection = () => {
    return (
        <div id="guide-section" className="w-full max-w-4xl mx-auto mt-12 px-4 pb-20 scroll-mt-[250px]">

            {/* --- セクション1: 詳細使い方ガイド (SEO/AdSense対策で拡充) --- */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b-2 border-blue-500 pb-2 inline-block">
                    使い方ガイドと便利な機能
                </h2>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">

                    {/* 1. このツールについて */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">1. このツールについて</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            アルバイトやパートで働く方が、「年収の壁（123万、130万など）」を超えないようにシフトを管理するための無料ツールです。面倒な会員登録やログインは一切不要。ブラウザを開くだけですぐに使えて、入力したデータはあなたのスマートフォンやパソコンの中に自動的に保存されます。
                        </p>
                    </div>

                    {/* 2. 基本的な操作方法 */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">2. 基本的な操作方法</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-lg">
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 text-sm">STEP 1: 設定</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    画面右上の「入力設定」アイコンから、現在の時給と、目標とする年収の壁（例: 130万円）を設定します。複数のバイト先がある場合は、時給リストに追加することで切り替えて入力できます。
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-lg">
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 text-sm">STEP 2: 入力</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    カレンダーの日付をタップしてシフトを入力します。「時間(h)入力」または「時刻指定（開始・終了）」の2つのモードを用途に合わせて使い分けられます。
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-lg">
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 text-sm">STEP 3: 確認</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    画面上部のプログレスバーで、あといくら稼げるかが一目でわかります。「今月の概算」は設定した締め日に基づいて自動計算されるので、給与明細との照らし合わせにも役立ちます。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. 便利な機能・カスタマイズ */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">3. 便利な機能・カスタマイズ</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>
                                <span className="font-bold text-gray-700 dark:text-gray-300">スケジュール帳機能:</span> 入力画面の「予定・メモ」タブから、遊びや学校の予定を登録できます。ヘッダーの「予定設定」から好きな色や名前（例：ピンクでデート）を自由にカスタマイズ可能です。
                            </li>
                            <li>
                                <span className="font-bold text-gray-700 dark:text-gray-300">給与締め日の変更:</span> 「システム設定」から締め日（20日締め、末日締めなど）を変更できます。カレンダー下のリストや月次集計が、実際の給与期間に合わせて自動で切り替わります。
                            </li>
                            <li>
                                <span className="font-bold text-gray-700 dark:text-gray-300">年収の壁攻略シミュレーター:</span> 画面下部にて、残りの扶養枠から「あと何時間（何日）働けるか」をリアルタイムで算出します。シフト調整の目安に最適です。
                            </li>
                            <li>
                                <span className="font-bold text-gray-700 dark:text-gray-300">シフト一括入力:</span> 「毎週月・水・金」のように決まったシフトがある場合は、右上の「一括入力」ボタンからまとめて登録すると便利です。
                            </li>
                        </ul>
                    </div>

                    {/* 4. データ管理とセキュリティ */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">4. データ管理とセキュリティ</h3>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <li>データの保存場所: 入力した情報は、すべてお使いのブラウザ内 (LocalStorage) に保存されます。外部サーバーに送信されることはありません。</li>
                            <li>機種変更時のバックアップ: 右上の「システム設定」を開き、「書き出し (JSON)」を行うことで、全データをファイルとして保存できます。新しいスマホで「読み込み」を行えば、データを完全に復元できます。</li>
                            <li>CSVエクスポート: 確定申告やExcel管理用に、入力データをCSV形式で出力することも可能です。</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* --- セクション2: 税制解説 (Step 7.5の内容を維持) --- */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b-2 border-green-500 pb-2 inline-block">
                    最新の税制・控除額の解説 (2026/01/21現在)
                </h2>

                <div className="space-y-10 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {/* 導入部 */}
                    <section>
                        <p>
                            このツールは、2025年度税制改正大綱などで議論されている新しい基準を考慮しています。
                            特に、給与所得控除の引き上げ等により「年収の壁」のラインが従来から変化しています。
                            <br />
                            <span className="text-xs text-gray-500 dark:text-gray-400">（2026年1月21日現在の情報に基づく）</span>
                        </p>
                    </section>

                    {/* 123万円の壁（扶養控除）の解説 */}
                    <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">
                            123万円の壁（扶養の壁・扶養控除）
                        </h3>
                        <p className="mb-4">
                            給与収入が123万円以下であれば、扶養控除を満額受けられる範囲となります（配偶者と16歳未満は対象外）。
                            これは、基礎控除と給与所得控除の合計額が123万円となるためです。
                        </p>

                        {/* 計算式の図示 */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-blue-200 dark:border-blue-700 my-4">
                            <p className="font-bold text-center mb-2">扶養控除の対象となる計算式</p>
                            <div className="flex flex-col items-center justify-center space-y-2 text-base font-mono">
                                <div className="w-full text-center border-b border-gray-300 pb-2">
                                    給与収入 ≦ 123万円
                                </div>
                                <div className="text-center text-xs text-gray-500">内訳</div>
                                <div className="w-full text-center">
                                    基礎控除 58万円 ＋ 給与所得控除 65万円
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 年収の壁 一覧表 */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                            パート・アルバイトの方が関係する年収の壁一覧
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                                        <th className="p-3 border-b dark:border-gray-600 whitespace-nowrap">壁の種類</th>
                                        <th className="p-3 border-b dark:border-gray-600 whitespace-nowrap">年収額</th>
                                        <th className="p-3 border-b dark:border-gray-600">影響と解説</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr>
                                        <td className="p-3 whitespace-nowrap">社会保険</td>
                                        <td className="p-3 font-bold text-red-600 dark:text-red-400">106万円</td>
                                        <td className="p-3">
                                            勤務先の規模（51人以上）等の条件により、社会保険への加入義務が発生します。手取りが減る可能性があります。
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 whitespace-nowrap">税金（扶養）</td>
                                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">123万円</td>
                                        <td className="p-3">
                                            扶養控除が受けられる上限ラインです。これを超えると、親や扶養者の税負担が増える（控除額が減る）可能性があります。
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 whitespace-nowrap">社会保険</td>
                                        <td className="p-3 font-bold text-red-600 dark:text-red-400">130万円</td>
                                        <td className="p-3">
                                            勤務先に関わらず、扶養から外れて自分で国民健康保険や国民年金に加入する必要があります。
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 whitespace-nowrap">税金（配偶者）</td>
                                        <td className="p-3 font-bold">150万円</td>
                                        <td className="p-3">
                                            配偶者特別控除が満額受けられなくなります。これ以降、段階的に控除額が減っていきます。
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 whitespace-nowrap">税金（本人）</td>
                                        <td className="p-3 font-bold text-red-600 dark:text-red-400">160万円</td>
                                        <td className="p-3">
                                            あなた自身に所得税が課され始めます（基礎控除95万円＋給与所得控除65万円＝160万円の計算に基づく）。
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 whitespace-nowrap">税金（配偶者）</td>
                                        <td className="p-3 font-bold">201万円</td>
                                        <td className="p-3">
                                            配偶者特別控除の対象から完全に外れます。
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 情報収集のアドバイス */}
                    <section className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">
                            最新情報の確認方法
                        </h3>
                        <p className="mb-4">
                            税制は年度ごとに改正される可能性があります。正確な情報は以下のキーワードや公式サイトでご確認ください。
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                            <ul className="list-disc list-inside space-y-2">
                                <li>
                                    <span className="font-bold">おすすめ検索ワード:</span> 「令和8年 扶養控除 改正」「年収の壁 最新情報」「国税庁 年末調整」
                                </li>
                                <li>
                                    <span className="font-bold">信頼できる情報源:</span> 国税庁、厚生労働省、日本年金機構の公式ウェブサイト
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default GuideSection;
