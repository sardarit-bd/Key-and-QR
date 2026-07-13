import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import authService from "@/services/auth.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect } from "react";

// ============================================================
// QUERY KEYS
// ============================================================

export const authKeys = {
    user: ["user"],
    session: ["session"],
    guestResources: ["guest-resources"],
};

// ============================================================
// REACT QUERY HOOKS
// ============================================================

/**
 * Get Current User Query
 * React Query manages server state
 * Zustand manages application state
 * Single source of truth for user data
 */
export function useCurrentUser() {
    const { user, isInitialized, updateUser } = useAuthStore();
    
    return useQuery({
        queryKey: authKeys.user,
        queryFn: async () => {
            const response = await authService.getCurrentUser();
            const freshUser = response?.data || null;
            
            // Update Zustand store (single write)
            if (freshUser) {
                updateUser(freshUser);
            }
            
            return freshUser;
        },
        enabled: isInitialized && !!useAuthStore.getState().getToken(),
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        // Zustand is the source of truth, React Query uses it as initial data
        initialData: user || undefined,
        placeholderData: user,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        // Only fetch if user exists in store
        select: (data) => data,
    });
}

/**
 * Login Mutation
 */
export function useLoginMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload) => {
            const result = await useAuthStore.getState().login(payload);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: (data) => {
            // Update React Query cache
            queryClient.setQueryData(authKeys.user, data.user);
            
            toast.success("Welcome back! 🎉");
            
            if (data.user?.role === "admin") {
                router.push("/dashboard/admin");
            } else {
                if (data.guestClaimed) {
                    toast.success(`Claimed ${data.guestOrders || 0} orders and ${data.guestTags || 0} tags! 🎉`);
                }
                router.push("/dashboard/user");
            }
        },
        onError: (error) => {
            toast.error(error.message || "Login failed");
        },
    });
}

/**
 * Register Mutation
 */
export function useRegisterMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload) => {
            const result = await useAuthStore.getState().register(payload);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.user, data.user);
            toast.success("Account created successfully! 🎉");
            
            if (data.guestClaimed) {
                toast.success("Your guest purchases have been claimed! 🎉");
            }
            
            if (data.user?.role === "admin") {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard/user");
            }
        },
        onError: (error) => {
            toast.error(error.message || "Registration failed");
        },
    });
}

/**
 * Logout Mutation
 */
export function useLogoutMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            await useAuthStore.getState().logout();
        },
        onSuccess: () => {
            queryClient.clear();
            toast.success("Logged out successfully");
            router.push("/login");
        },
        onError: (error) => {
            console.error("Logout error:", error);
            useAuthStore.getState().logout();
        },
    });
}

// ============================================================
// CUSTOM HOOKS
// ============================================================

export function useRedirectAuthenticated(redirectTo = null) {
    const { user, isInitialized, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized || loading) return;

        if (user) {
            const target = redirectTo || (user.role === "admin" ? "/dashboard/admin" : "/dashboard/user");
            router.replace(target);
        }
    }, [user, isInitialized, loading, redirectTo, router]);
}

export function useRequireAuth(redirectTo = "/login") {
    const { user, isInitialized, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized || loading) return;

        if (!user) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.replace(`${redirectTo}?redirect=${returnUrl}`);
        }
    }, [user, isInitialized, loading, redirectTo, router]);

    return { user, isLoading: loading || !isInitialized };
}

export function useAdminCheck() {
    const { user, isInitialized, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized || loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (user.role !== "admin") {
            router.replace("/dashboard/user");
        }
    }, [user, isInitialized, loading, router]);

    return { user, isAdmin: user?.role === "admin", isLoading: loading || !isInitialized };
}

export function useGuestResources() {
    const { user, isInitialized } = useAuthStore();

    return useQuery({
        queryKey: authKeys.guestResources,
        queryFn: async () => {
            const response = await authService.checkGuestResources();
            return response?.data || null;
        },
        enabled: isInitialized && !!user,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

export function useClaimGuestResourcesMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await authService.claimGuestResources();
            return response?.data || null;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: authKeys.guestResources });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            
            if (data?.ordersClaimed > 0 || data?.tagsClaimed > 0) {
                toast.success(
                    `Claimed ${data.ordersClaimed || 0} orders and ${data.tagsClaimed || 0} tags! 🎉`
                );
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to claim guest resources");
        },
    });
}