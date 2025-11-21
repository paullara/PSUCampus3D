export default function ApplicationLogo(props) {
    return (
        <div className="flex justify-center items-center">
            <img
                src="/logo/psu.png"
                alt="PSU Logo"
                className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain drop-shadow-lg"
                {...props}
            />
        </div>
    );
}
