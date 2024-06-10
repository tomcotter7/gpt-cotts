"use client";
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';

function LoginForm({ handleSubmit, handleChange, credentials }) {

    return (
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="flex flex-row">
                <label className="block text-black" htmlFor="username">Username</label>
            </div>
            <div className="flex flex-row">
                    <input
                        className="text-black w-full border rounded focus:outline-none focus:ring-2 focus:ring-tangerine focus:border-transparent p-2"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                    />
            </div>
            <div className="flex flex-row">
                <label className="block text-black" htmlFor="password">Password</label>
            </div>
            <div className="flex flex-row">
                <input
                    className="text-black w-full border rounded focus:outline-none focus:ring-2 focus:ring-tangerine focus:border-transparent p-2"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <button className="border bg-tangerine hover:bg-tangerine-dark text-black m-4" type="submit"><b>Log in</b></button>
        </form>
    );
}

export default function LoginPage() {


    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);


    async function handleSubmit(e) {
        setLoading(true);
        e.preventDefault();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=password&username=${credentials.username}&password=${credentials.password}&scope=&client_id=&client_secret=`,
        }).then((res) => res.json());
        setLoading(false);
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('username', credentials.username);
        window.location.href = '/';
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <div className="flex flex-col text-center items-center mt-2 gap-2">
            <h1 className="text-4xl font-bold text-white"><u>Login</u></h1>
            <LoginForm handleSubmit={handleSubmit} handleChange={handleChange} credentials={credentials} />
            {loading && <div><ClipLoader color="#96f4a2" size="25px" /></div>}
        </div>
    );
}
