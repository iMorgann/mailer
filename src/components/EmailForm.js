import React, { useState } from 'react';
import axios from 'axios';

const EmailForm = () => {
    const [formData, setFormData] = useState({
        smtp_server: '',
        smtp_port: '',
        smtp_username: '',
        smtp_password: '',
        from_email: '',
        from_name: '',
        recipients: '', // Comma-separated or line-separated emails
        subject: '',
        body: '',
        body_type: 'plain', // Default to plain text
        reply_to: '', // Reply-To field
        priority: '3', // Default to normal priority
    });

    const [progress, setProgress] = useState('');
    const [statusDetails, setStatusDetails] = useState([]);
    const [fileInput, setFileInput] = useState(null);
    const [interval, setIntervalValue] = useState(0); // Time interval in seconds

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData((prev) => ({
                    ...prev,
                    recipients: event.target.result.trim().replace(/\n/g, ','),
                }));
            };
            reader.readAsText(file);
            setFileInput(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.recipients.trim()) {
            setProgress('Error: No recipients provided.');
            console.error('No recipients provided.');
            return;
        }

        setProgress('Sending emails...');
        try {
            const response = await axios.post('https://backend-email-4a0f561698ea.herokuapp.com/send_email', {
                ...formData,
                interval, // Pass the interval to the backend
            });

            const results = response.data.results.map(
                (r) => `${r.index}/${r.total} ${r.recipient} -------- ${r.status}`
            );

            setStatusDetails(results);
            setProgress('Email sending completed!');
        } catch (error) {
            setProgress('Error sending emails.');
            console.error(error);
        }
    };


    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">ROOT WEB Email Service ,powered by node</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {[ // Input fields
                    { label: 'SMTP Server', type: 'text', name: 'smtp_server' },
                    { label: 'SMTP Port', type: 'number', name: 'smtp_port' },
                    { label: 'SMTP Username', type: 'text', name: 'smtp_username' },
                    { label: 'SMTP Password', type: 'password', name: 'smtp_password' },
                    { label: 'From Email', type: 'email', name: 'from_email' },
                    { label: 'From Name', type: 'text', name: 'from_name' },
                    { label: 'Subject', type: 'text', name: 'subject' },
                ].map(({ label, ...inputProps }) => (
                    <div key={inputProps.name} className="flex flex-col">
                        <label className="font-medium text-gray-700">{label}</label>
                        <input
                            {...inputProps}
                            className="mt-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Body Type</label>
                    <select
                        name="body_type"
                        value={formData.body_type}
                        className="mt-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        onChange={handleChange}
                    >
                        <option value="plain">Plain Text</option>
                        <option value="html">HTML</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">
                        Body ({formData.body_type === 'plain' ? 'Plain Text' : 'HTML'})
                    </label>
                    <textarea
                        name="body"
                        rows="10"
                        placeholder={
                            formData.body_type === 'plain'
                                ? 'Enter plain text email body here...'
                                : 'Enter HTML email body here...'
                        }
                        className="mt-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        value={formData.body}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Reply-To</label>
                    <input
                        type="email"
                        name="reply_to"
                        placeholder="Reply-To Email"
                        className="mt-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        value={formData.reply_to}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Recipients (comma-seperated)</label>
                    <textarea
                        name="recipients"
                        rows="5"
                        placeholder="Enter emails separated by commas or new lines"
                        className="mt-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        value={formData.recipients}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Or Upload File</label>
                    <input
                        type="file"
                        accept=".txt"
                        className="mt-1"
                        onChange={handleFileUpload}
                    />
                    {fileInput && <p className="text-sm text-gray-500 mt-1">Uploaded file: {fileInput}</p>}
                </div>
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Time Interval (seconds)</label>
                    <input
                        type="number"
                        min="0"
                        className="mt-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        value={interval}
                        onChange={(e) => setIntervalValue(parseInt(e.target.value, 10) || 0)}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Send Email
                </button>
            </form>
            {progress && <p className="mt-4 text-blue-600 font-medium">{progress}</p>}
            {statusDetails.length > 0 && (
                <div className="mt-2 p-2 bg-gray-100 border-l-4 border-blue-500 text-gray-700 rounded">
                    <pre>{statusDetails.join('\n')}</pre>
                </div>
            )}
        </div>
    );
};

export default EmailForm;
