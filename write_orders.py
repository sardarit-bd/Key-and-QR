target = r'src\app\(dashboard)\new-dashboard\user\orders\page.jsx'

p1 = """'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, ShoppingBag, Search, X, Eye, Copy, CreditCard, MapPin, ChevronsRight, AlertCircle, CheckCircle2, Pencil, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination from '@/components/ui/Pagination';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';

"""

with open(target, 'w', encoding='utf-8') as f:
    f.write(p1)
print('part1 done')
