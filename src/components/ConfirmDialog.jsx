import PropTypes from 'prop-types';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                </div>

                <div className="p-6">
                    <p className="text-slate-300">{message}</p>
                </div>

                <div className="p-6 border-t border-slate-800 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

ConfirmDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

export default ConfirmDialog;
