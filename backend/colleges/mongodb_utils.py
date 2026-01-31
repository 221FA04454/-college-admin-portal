from pymongo import MongoClient
import gridfs
from django.conf import settings

_client = None
_fs = None

def get_db():
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI)
    try:
        return _client.get_database() # Uses the default db from the URI
    except Exception:
        # Fallback if no default db in URI
        return _client.get_database('college_admin_portal')

def get_gridfs():
    global _fs
    if _fs is None:
        db = get_db()
        _fs = gridfs.GridFS(db)
    return _fs

def upload_file_to_mongo(file_data, filename, content_type=None):
    """
    Uploads a file-like object to MongoDB GridFS.
    Returns the file_id (str).
    """
    fs = get_gridfs()
    # gridfs.put returns the ObjectId of the file
    file_id = fs.put(file_data, filename=filename, content_type=content_type)
    return str(file_id)

def get_file_from_mongo(file_id):
    """
    Retrieves a file from GridFS by its ID (str or ObjectId).
    Returns the GridOut object (readable).
    """
    from bson.objectid import ObjectId
    fs = get_gridfs()
    if isinstance(file_id, str):
        file_id = ObjectId(file_id)
    return fs.get(file_id)

def delete_file_from_mongo(file_id):
    """
    Deletes a file from GridFS.
    """
    from bson.objectid import ObjectId
    fs = get_gridfs()
    if isinstance(file_id, str):
        file_id = ObjectId(file_id)
    fs.delete(file_id)
