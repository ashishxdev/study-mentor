import { supabase } from './supabaseClient';

export async function signUpWithEmail({ email, password, name }) {
    
    const currentDomain = window.location.origin;
    
    const redirectUrl = currentDomain.includes('localhost') 
        ? `${currentDomain}/auth/callback`
        : `https://testing-six-topaz-75.vercel.app/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
            data: { name },
            emailRedirectTo: redirectUrl
        },
    });
        
    return { data, error };
}

export async function signInWithEmail({ email, password }) {
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
    });
        
    return { data, error };
}

export function onAuthChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
    });
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function fetchNotes(userId) {
    const { data, error } = await supabase.from('notes').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function upsertNote(userId, note) {
    const row = { id: note.id, user_id: userId, title: note.title, content: note.content, timestamp: note.timestamp || new Date().toISOString() };
    const { error } = await supabase.from('notes').upsert(row, { on_conflict: 'id' });
    if (error) throw error;
}

export async function deleteNote(userId, noteId) {
    const { error } = await supabase.from('notes').delete().eq('user_id', userId).eq('id', noteId);
    if (error) throw error;
}

export async function fetchTasks(userId) {
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function upsertTask(userId, task) {
    const row = { id: task.id, user_id: userId, text: task.text, completed: task.completed, created_at: task.created_at || new Date().toISOString() };
    const { error } = await supabase.from('tasks').upsert(row, { on_conflict: 'id' });
    if (error) throw error;
}

export async function deleteTask(userId, taskId) {
    const { error } = await supabase.from('tasks').delete().eq('user_id', userId).eq('id', taskId);
    if (error) throw error;
}

export async function fetchDecks(userId) {
    const { data, error } = await supabase.from('decks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function upsertDeck(userId, deck) {
    const row = { id: deck.id, user_id: userId, name: deck.name, created_at: deck.created_at || new Date().toISOString() };
    const { error } = await supabase.from('decks').upsert(row, { on_conflict: 'id' });
    if (error) throw error;
}

export async function deleteDeck(userId, deckId) {
    const { error } = await supabase.from('decks').delete().eq('user_id', userId).eq('id', deckId);
    if (error) throw error;
}

export async function fetchCards(userId, deckId) {
    const { data, error } = await supabase.from('cards').select('*').eq('user_id', userId).eq('deck_id', deckId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function upsertCard(userId, card) {
    const row = { id: card.id, user_id: userId, deck_id: card.deckId, front: card.front, back: card.back, created_at: card.created_at || new Date().toISOString() };
    const { error } = await supabase.from('cards').upsert(row, { on_conflict: 'id' });
    if (error) throw error;
}

export async function deleteCardRow(userId, cardId) {
    const { error } = await supabase.from('cards').delete().eq('user_id', userId).eq('id', cardId);
    if (error) throw error;
}

export async function upsertActivity(userId, date, { notes = 0, timer = 0, total = 0 }) {
    const row = { user_id: userId, date, notes_count: notes, timer_count: timer, total };
    const { error } = await supabase.from('activities').upsert(row, { on_conflict: 'user_id,date' });
    if (error) throw error;
}

export async function fetchActivities(userId) {
    const { data, error } = await supabase.from('activities').select('*').eq('user_id', userId);
    if (error) throw error;
    const map = {};
    (data || []).forEach(r => { map[r.date] = { notes: r.notes_count, timer: r.timer_count, total: r.total }; });
    return map;
}

export async function syncLocalDataToSupabase(userId) {
    try {
        const localNotes = JSON.parse(localStorage.getItem('studyNotes') || '[]');
        for (const note of localNotes) {
            await upsertNote(userId, note);
        }

        const localTasks = JSON.parse(localStorage.getItem('studyTasks') || '[]');
        for (const task of localTasks) {
            await upsertTask(userId, task);
        }

        const localDecks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        for (const deck of localDecks) {
            await upsertDeck(userId, { id: deck.id, name: deck.name, created_at: new Date().toISOString() });
            
            if (deck.cards && deck.cards.length > 0) {
                for (const card of deck.cards) {
                    await upsertCard(userId, {
                        id: card.id,
                        deckId: deck.id,
                        front: card.front,
                        back: card.back,
                        created_at: new Date().toISOString()
                    });
                }
            }
        }

        const localActivities = JSON.parse(localStorage.getItem('studyActivities') || '{}');
        for (const [date, activity] of Object.entries(localActivities)) {
            await upsertActivity(userId, date, {
                notes: activity.notes || 0,
                timer: activity.timer || 0,
                total: activity.total || 0
            });
        }

        return true;
    } catch {
        return false;
    }
}

export async function loadDataFromSupabase(userId) {
    try {
        const notes = await fetchNotes(userId);
        const tasks = await fetchTasks(userId);
        const decks = await fetchDecks(userId);
        const activities = await fetchActivities(userId);
        
        const decksWithCards = await Promise.all(
            decks.map(async (deck) => {
                const cards = await fetchCards(userId, deck.id);
                return { ...deck, cards };
            })
        );

        const localNotes = JSON.parse(localStorage.getItem('studyNotes') || '[]');
        const localTasks = JSON.parse(localStorage.getItem('studyTasks') || '[]');
        const localDecks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        const localActivities = JSON.parse(localStorage.getItem('studyActivities') || '{}');

        const mergedNotes = [...notes];
        const noteIds = new Set(notes.map(n => n.id));
        localNotes.forEach(note => {
            if (!noteIds.has(note.id)) {
                mergedNotes.push(note);
            }
        });

        const mergedTasks = [...tasks];
        const taskIds = new Set(tasks.map(t => t.id));
        localTasks.forEach(task => {
            if (!taskIds.has(task.id)) {
                mergedTasks.push(task);
            }
        });

        const mergedDecks = [...decksWithCards];
        const deckIds = new Set(decksWithCards.map(d => d.id));
        localDecks.forEach(deck => {
            if (!deckIds.has(deck.id)) {
                mergedDecks.push(deck);
            }
        });
        const mergedActivities = { ...localActivities, ...activities };
        localStorage.setItem('studyNotes', JSON.stringify(mergedNotes));
        localStorage.setItem('studyTasks', JSON.stringify(mergedTasks));
        localStorage.setItem('flashcardDecks', JSON.stringify(mergedDecks));
        localStorage.setItem('studyActivities', JSON.stringify(mergedActivities));

        return true;
    } catch (error) {
        console.error('Load from Supabase failed:', error);
        return false;
    }
}