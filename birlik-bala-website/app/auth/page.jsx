// app/auth/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });



  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Имя пользователя обязательно";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен быть не менее 6 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      const endpoint = isLogin ? "/api/auth/sign-in" : "/api/auth/sign-up";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("[AuthPage] Ответ сервера:", data);

      if (response.ok || data.Message) {
        router.push("/courses");
        router.refresh();

      } else {
        let errorMessage = "Произошла ошибка, попробуйте заново проверив данные";
        setServerError(errorMessage);
      }
    } catch (error) {
      console.error("[AuthPage] Ошибка соединения:", error.message);
      setServerError("Ошибка соединения с сервером");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    setServerError("");
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setServerError("");
    setFormData({
      username: "",
      password: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gray-900">
            BIRLIK BALA
          </Link>
          <p className="text-gray-600 mt-2">{isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}</p>
        </div>

        <Card className="p-6">
          <CardContent>
            {serverError && (
              <div className="mb-6 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя пользователя <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => updateField("username", e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.username ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Введите имя пользователя"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Введите пароль"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">Пароль должен содержать минимум 6 символов</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isLogin ? "Вход..." : "Регистрация..."}</span>
                  </div>
                ) : (
                  <span>{isLogin ? "Войти" : "Зарегистрироваться"}</span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={switchMode} className="text-blue-600 hover:text-blue-700 text-sm">
                {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
              </button>
            </div>

            {!isLogin && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  Регистрируясь, вы получите доступ к бесплатным курсам и сможете отслеживать свой прогресс обучения.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}