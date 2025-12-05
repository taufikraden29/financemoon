import clsx from 'clsx';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const Toast = ({ id, message, type, onClose }) => {
    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: Info,
        warning: AlertTriangle
    };

    const Icon = icons[type] || Info;

    const styles = {
        success: 'bg-green-500/90 border-green-400',
        error: 'bg-red-500/90 border-red-400',
        info: 'bg-blue-500/90 border-blue-400',
        warning: 'bg-yellow-500/90 border-yellow-400'
    };

    return (
        <div
            className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm min-w-[300px] max-w-md',
                'animate-in slide-in-from-right duration-300',
                styles[type] || styles.info
            )}
        >
            <Icon className="w-5 h-5 text-white flex-shrink-0" />
            <p className="text-white font-medium flex-1">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="text-white/80 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

Toast.propTypes = {
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Toast;
