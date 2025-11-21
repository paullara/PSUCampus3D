export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    // Check if className contains text color override
    const hasTextColor = className.includes('text-');
    
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium ${hasTextColor ? '' : 'text-gray-700'} ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
