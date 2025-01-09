import { Observable } from '@nativescript/core';
import { supabase } from '../../services/supabase';

export class AuthViewModel extends Observable {
    private _isLogin = true;
    private _isLoggedIn = false;
    private _username = '';
    private _email = '';
    private _password = '';

    constructor() {
        super();
        this.checkSession();
    }

    async checkSession() {
        const session = await supabase.auth.getSession();
        this._isLoggedIn = !!session.data.session;
        this.notifyPropertyChange('isLoggedIn', this._isLoggedIn);
    }

    get isLogin(): boolean {
        return this._isLogin;
    }

    get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    get username(): string {
        return this._username;
    }

    get email(): string {
        return this._email;
    }

    get password(): string {
        return this._password;
    }

    set username(value: string) {
        if (this._username !== value) {
            this._username = value;
            this.notifyPropertyChange('username', value);
        }
    }

    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notifyPropertyChange('email', value);
        }
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    toggleForm() {
        this._isLogin = !this._isLogin;
        this.notifyPropertyChange('isLogin', this._isLogin);
    }

    async onLogin() {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: this._email,
                password: this._password
            });

            if (error) throw error;
            
            this._isLoggedIn = true;
            this.notifyPropertyChange('isLoggedIn', true);
        } catch (error) {
            console.error('Login error:', error.message);
        }
    }

    async onRegister() {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: this._email,
                password: this._password,
                options: {
                    data: {
                        username: this._username
                    }
                }
            });

            if (error) throw error;

            // After successful registration, automatically log in
            await this.onLogin();
        } catch (error) {
            console.error('Registration error:', error.message);
        }
    }

    async onLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this._isLoggedIn = false;
            this.notifyPropertyChange('isLoggedIn', false);
        } catch (error) {
            console.error('Logout error:', error.message);
        }
    }
}