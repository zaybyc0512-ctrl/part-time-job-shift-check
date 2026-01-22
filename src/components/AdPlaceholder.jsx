const AdPlaceholder = ({ size = 'medium', className = '' }) => {
    const getHeight = () => {
        switch (size) {
            case 'small': return 'h-[100px]'; // In-feed / Header
            case 'large': return 'h-[250px]'; // Rectangle / Footer
            default: return 'h-[250px]';
        }
    };

    return (
        <div className={`w-full bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 border-dashed ${getHeight()} ${className}`}>
            <span className="text-sm font-bold text-gray-400">広告スペース</span>
        </div>
    );
};

export default AdPlaceholder;
